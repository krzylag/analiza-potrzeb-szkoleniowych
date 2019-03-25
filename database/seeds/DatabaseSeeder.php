<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Create admin account. Login "admin" password "secret"
        DB::table('users')->insert([
            'firstname' => "Administrator",
            'surname' => "Administrator",
            'email' => 'admin@example.com',
            'email_verified_at' => now(),
            'password' => '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', // secret
            'remember_token' => str_random(10),
            'is_admin' => 1,
            'capabilities_json' => '{}',
            'created_at' => now(),
            'updated_at' => now()
        ]);

    }
}
