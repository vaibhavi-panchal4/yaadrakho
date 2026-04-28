<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entry extends Model
{
    protected $fillable = [
        'event_id',
        'person_id',
        'gift_type',
        'sub_event_id',
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

    public function subEvent()
    {
        return $this->belongsTo(SubEvent::class);
    }
}
