<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;

class PersonController extends Controller
{
    public function checkOrCreate(Request $request)
    {
        $name = $request->name;

        $normalized = strtolower(str_replace(' ', '', $name));

        $similar = Person::where('user_id', auth()->id())
            ->where('normalized_name', 'LIKE', "%$normalized%")
            ->get();

        if ($similar->count() > 0 && !$request->confirmed) {
            return response()->json([
                'status' => 'similar_found',
                'data' => $similar
            ]);
        }

        $person = Person::create([
            'user_id' => auth()->id(),
            'name' => $name,
            'normalized_name' => $normalized
        ]);

        return response()->json([
            'status' => 'created',
            'data' => $person
        ]);
    }

    public function update($id, Request $request)
    {
        $request->validate([
            'name' => 'required|string'
        ]);

        $person = Person::findOrFail($id);

        $normalized = strtolower(str_replace(' ', '', $request->name));

        $person->update([
            'name' => $request->name,
            'normalized_name' => $normalized
        ]);

        return response()->json($person);
    }
}
