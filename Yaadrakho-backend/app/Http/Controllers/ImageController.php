<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image',
            'event_id' => 'required|exists:events,id'
        ]);

        $file = $request->file('image');

        // 🔥 STEP 1: IMAGE PREPROCESSING (light)
        $manager = new ImageManager(new Driver());

        $image = $manager->read($file->getRealPath())
            ->greyscale()
            ->contrast(10);

        $tempPath = storage_path('app/temp_processed.jpg');
        $image->save($tempPath);

        // 🔥 STEP 2: OCR API
        $response = Http::attach(
            'file',
            fopen($tempPath, 'r'),
            'processed.jpg'
        )->post('https://api.ocr.space/parse/image', [
            'apikey' => env('OCR_API_KEY'),
            'language' => 'eng',
            'OCREngine' => 2
        ]);

        $result = $response->json();

        $text = $result['ParsedResults'][0]['ParsedText'] ?? '';

        // 🔥 STEP 3: CLEAN TEXT
        $lines = array_values(array_filter(array_map('trim', explode("\n", $text))));

        $data = [];

        // 🔹 STEP 4: DIRECT PARSING
        foreach ($lines as $line) {

            if (preg_match('/([A-Za-z ]+)[^\d]*(\d{2,6})/', $line, $matches)) {

                // 🧹 CLEAN NAME
                $name = trim($matches[1]);
                $name = preg_replace('/\b(gave|rs|rupees)\b/i', '', $name);
                $name = preg_replace('/[^A-Za-z ]/', '', $name);
                $name = trim(preg_replace('/\s+/', ' ', $name));

                // 🧹 CLEAN AMOUNT
                $amount = (int) preg_replace('/[^\d]/', '', $matches[2]);

                // ❌ Skip duplicate in same upload
                if (collect($data)->contains(fn($d) => $d['name'] === $name)) {
                    continue;
                }

                if ($name && $amount) {
                    $data[] = [
                        'name' => $name,
                        'amount' => $amount
                    ];
                }
            }
        }

        // 🔹 STEP 5: FALLBACK (if needed)
        // 🔹 STEP 5: ALSO RUN FALLBACK (always)
        $names = [];
        $amounts = [];

        foreach ($lines as $line) {
            if (preg_match('/^[A-Za-z ]+$/', $line)) {
                $names[] = $line;
            } elseif (preg_match('/\d+/', $line)) {
                $amounts[] = (int) preg_replace('/[^\d]/', '', $line);
            }
        }

        $count = min(count($names), count($amounts));

        for ($i = 0; $i < $count; $i++) {

            $name = trim($names[$i]);
            $amount = $amounts[$i];

            // ❌ avoid duplicates
            if (collect($data)->contains(fn($d) => $d['name'] === $name)) {
                continue;
            }

            if ($name && $amount) {
                $data[] = [
                    'name' => $name,
                    'amount' => $amount
                ];
            }
        }

        // 🔥 STEP 6: RESPONSE (NO DB SAVE)
        return response()->json([
            'status' => 'preview_ready',
            'extracted_text' => $text,
            'parsed_data' => $data
        ]);
    }
}