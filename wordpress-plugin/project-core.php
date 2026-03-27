<?php
/**
 * Plugin Name:       Project Core
 * Description:       A professional foundation for Headless WordPress & WooCommerce projects.
 * Version:           1.3.1
 * Author:            Fares
 * Text Domain:       project-core
 * Domain Path:       /languages
 *
 * @package ProjectCore
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define constants.
 */
define( 'PROJECT_CORE_VERSION', '1.3.1' );
define( 'PROJECT_CORE_PATH', plugin_dir_path( __FILE__ ) );
define( 'PROJECT_CORE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Require Composer Autoloader or provide a manual fallback.
 */
if ( file_exists( PROJECT_CORE_PATH . 'vendor/autoload.php' ) ) {
	require_once PROJECT_CORE_PATH . 'vendor/autoload.php';
} else {
	/**
	 * Simple PSR-4 Autoloader Fallback
	 */
	spl_autoload_register( function ( $class ) {
		$prefix   = 'ProjectCore\\';
		$base_dir = PROJECT_CORE_PATH . 'src/';

		$len = strlen( $prefix );
		if ( strncmp( $prefix, $class, $len ) !== 0 ) {
			return;
		}

		$relative_class = substr( $class, $len );
		$file = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';

		if ( file_exists( $file ) ) {
			require $file;
		}
	} );
}

/**
 * Activation/Deactivation hooks.
 */
function activate_project_core() {
	ProjectCore\Core\Activator::activate();
}

function deactivate_project_core() {
	ProjectCore\Core\Activator::deactivate();
}

register_activation_hook( __FILE__, 'activate_project_core' );
register_deactivation_hook( __FILE__, 'deactivate_project_core' );

/**
 * Instantiate and run the plugin.
 */
function run_project_core() {
	$plugin = ProjectCore\Core\Plugin::get_instance();
	$plugin->run();
}

run_project_core();

/**
 * Enable Standard WordPress REST API support for existing Post Types (Projects & Partners).
 * This allows the React frontend to fetch data directly via /wp-json/wp/v2/ endpoints.
 */
add_filter( 'register_post_type_args', function( $args, $post_type ) {
	// Enable Projects (Portfolio from Woodmart theme)
	if ( 'portfolio' === $post_type ) {
		$args['show_in_rest'] = true;
		$args['rest_base']    = 'projects'; // Access via /wp-json/wp/v2/projects
	}

	// Enable Partners (Logos from Showcase plugin)
	if ( 'logoshowcase' === $post_type ) {
		$args['show_in_rest'] = true;
		$args['rest_base']    = 'partners'; // Access via /wp-json/wp/v2/partners
	}

	return $args;
}, 10, 2 );

/**
 * Enable REST API for Project Categories.
 */
add_filter( 'register_taxonomy_args', function( $args, $taxonomy ) {
	if ( 'project-cat' === $taxonomy ) {
		$args['show_in_rest'] = true;
	}
	return $args;
}, 10, 2 );
