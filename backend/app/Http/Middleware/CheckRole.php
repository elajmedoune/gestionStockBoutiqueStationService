<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**Verifier que l'utilisateur connecte possede l'un des roles autorises.
     * Usage dans les routes:
     *  Route::middleware('role: admin')
     *  Route::middleware('role: admin, gestionaire')
     */
    
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        if(! $user || ! in_array($user->role, $roles)){
            return response()->json([
                'message'   => 'Acces refuse. Droits insuffisants.',
            ], 403);
        }
        return $next($request);
    }
}
