<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    protected $fillable = [
        'event_id',
        'person_id',
        'gift_type',
        'amount',
        'item_name',
        'notes'
    ];

    public function person()
    {
        return $this->belongsTo(\App\Models\Person::class);
    }

    public function event()
    {
        return $this->belongsTo(\App\Models\Event::class);
    }
}
