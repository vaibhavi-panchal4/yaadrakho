<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Person extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'normalized_name',
        'phone',
        'relation'
    ];

    public function entries()
    {
        return $this->hasMany(\App\Models\Entry::class);
    }
}
