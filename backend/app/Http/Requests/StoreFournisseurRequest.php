<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFournisseurRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' =>'required|string|max:100',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'telephone' =>'nullable|regex:/^\+[0-9]{2,4}[0-9]{9}$/',
            'email' =>'nullable|max:100|regex:/^[a-zA-Z0-9]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/',
            'adresse' =>'nullable|string|max:100',
            'delaiLivraison' =>'required|integer|min:1',
        ];
    }
}
