<?php

namespace ProjectCore\Core;

/**
 * Fired during plugin activation and deactivation.
 *
 * This class defines all code necessary to run during the plugin's
 * activation and deactivation.
 *
 * @package ProjectCore\Core
 */
class Activator {

	/**
	 * Run on plugin activation.
	 */
	public static function activate() {
		// Logic to run during activation (e.g., flush rewrites, initialize DB).
	}

	/**
	 * Run on plugin deactivation.
	 */
	public static function deactivate() {
		// Logic to run during deactivation.
	}
}
