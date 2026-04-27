<?php

namespace App\Http\Controllers;

use App\Models\Person;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->q;

        $people = Person::where('user_id', auth()->id())
            ->where('name', 'LIKE', "%$q%")
            ->with(['entries.event'])
            ->get();

        return response()->json($people);
    }
}