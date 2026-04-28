<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SuggestionController;
use App\Http\Controllers\ImageController;


// Public routes
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/login', [AuthenticatedSessionController::class, 'store']);

// Protected route
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->post('/upload-image', [ImageController::class, 'upload']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/events', [EventController::class, 'store']);
    Route::get('/events', [EventController::class, 'index']);
    Route::post('/people/check-or-create', [PersonController::class, 'checkOrCreate']);
    Route::post('/entries', [EntryController::class, 'store']);
    Route::get('/events/{eventId}/entries', [EntryController::class, 'getByEvent']);
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/suggest-smart', [SuggestionController::class, 'suggestSmart']);
    Route::post('/entries/save-bulk', [EntryController::class, 'saveBulk']);
    Route::get('/events-with-entries', [EventController::class, 'withEntries']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::put('/entries/{id}', [EntryController::class, 'update']);
    Route::delete('/entries/{id}', [EntryController::class, 'destroy']);

});