<?php

namespace ProjectCore\PostTypes;

/**
 * Register Home Slider Custom Post Type.
 *
 * Each post represents a single slide in the home page slider.
 * Optimized for headless usage by keeping the CPT private and exposing data via custom REST.
 *
 * @package ProjectCore\PostTypes
 */
class HomeSlider {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'home_slider';

	/**
	 * Initialize the class and register hooks.
	 */
	public function register() {
		add_action( 'init', [ $this, 'register_post_type' ] );
	}

	/**
	 * Register the custom post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Home Slider', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Slide', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Home Slider', 'project-core' ),
			'add_new_item'       => __( 'Add New Slide', 'project-core' ),
			'edit_item'          => __( 'Edit Slide', 'project-core' ),
			'update_item'        => __( 'Update Slide', 'project-core' ),
			'search_items'       => __( 'Search Slides', 'project-core' ),
			'not_found'          => __( 'No slides found', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Home Slider', 'project-core' ),
			'description'         => __( 'Homepage main slider items', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title' ],
			'hierarchical'        => false,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 30,
			'menu_icon'           => 'dashicons-images-alt2',
			'show_in_rest'        => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'post',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
