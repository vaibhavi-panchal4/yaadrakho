<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'date' => 'required|date',
        ]);

        $event = \App\Models\Event::create([
            'user_id' => auth()->id(),
            'title' => $request->name,       // ✅ FIX HERE
            'event_date' => $request->date,  // ✅ FIX HERE
        ]);

        return response()->json($event);
    }

    public function index()
    {
        return Event::where('user_id', auth()->id())->get();
    }

    public function withEntries()
    {
        return \App\Models\Event::with(['entries.person'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();
    }
}