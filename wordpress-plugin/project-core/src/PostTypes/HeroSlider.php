<?php

namespace ProjectCore\PostTypes;

/**
 * Class HeroSlider
 *
 * Registers the 'Hero Slider' (Main Homepage) Custom Post Type.
 */
class HeroSlider {

	const POST_TYPE = 'hero-slides';

	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Hero Slider', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Hero Slide', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Hero Slider', 'project-core' ),
			'all_items'          => __( 'All Hero Slides', 'project-core' ),
			'add_new_item'       => __( 'Add New Hero Slide', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'edit_item'          => __( 'Edit Slide', 'project-core' ),
			'update_item'        => __( 'Update Slide', 'project-core' ),
			'view_item'          => __( 'View Slide', 'project-core' ),
			'not_found'          => __( 'No slides found', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Hero Slider', 'project-core' ),
			'description'         => __( 'Main homepage sliders', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title', 'thumbnail' ], 
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 30,
			'menu_icon'           => 'dashicons-images-alt2',
			'show_in_rest'        => true, 
			'rest_base'           => 'hero-slides',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
