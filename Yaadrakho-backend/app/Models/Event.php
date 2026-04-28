<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'event_date'
    ];

    public function entries()
    {
        return $this->hasMany(\App\Models\Entry::class);
    }

    public function subEvents() 
    {
        return $this->hasMany(SubEvent::class);
    }
}
