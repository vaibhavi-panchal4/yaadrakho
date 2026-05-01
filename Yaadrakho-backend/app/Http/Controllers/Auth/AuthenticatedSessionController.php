<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Resend;

class AuthenticatedSessionController extends Controller
{
    public function sendOtp(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);

            $user = \App\Models\User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            $otp = rand(100000, 999999);

            \DB::table('password_resets')->updateOrInsert(
                ['email' => $request->email],
                ['otp' => $otp, 'created_at' => now()]
            );

            // 🔥 RESEND EMAIL
            $resend = Resend::client(env('RESEND_API_KEY'));

            $resend->emails->send([
                'from' => 'onboarding@resend.dev',
                'to' => [$request->email],
                'subject' => 'Password Reset OTP',
                'html' => "<strong>Your OTP is: $otp</strong>",
            ]);

            return response()->json(['message' => 'OTP sent']);

        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:6'
        ]);

        $record = DB::table('password_resets')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid OTP'], 400);
        }

        \App\Models\User::where('email', $request->email)
            ->update([
                'password' => \Illuminate\Support\Facades\Hash::make($request->password)
            ]);

        DB::table('password_resets')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password reset successful']);
    }

    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function destroy(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out']);
    }
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password)
        ]);

        return response()->json(['message' => 'Password reset successful']);
    }
}