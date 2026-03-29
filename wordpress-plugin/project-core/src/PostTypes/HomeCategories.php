<?php

namespace ProjectCore\PostTypes;

/**
 * Class HomeCategories
 *
 * Registers the 'Home Categories' Custom Post Type for the 3D Categories Slider.
 */
class HomeCategories {

	const POST_TYPE = 'home-categories';

	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Home Categories', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Home Category', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Home Categories', 'project-core' ),
			'all_items'          => __( 'All Categories', 'project-core' ),
			'add_new_item'       => __( 'Add New Category', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'edit_item'          => __( 'Edit Category', 'project-core' ),
			'view_item'          => __( 'View Category', 'project-core' ),
			'not_found'          => __( 'No categories found', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Home Categories', 'project-core' ),
			'description'         => __( '3D Slider Categories for Homepage', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title' ], 
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 30,
			'menu_icon'           => 'dashicons-tag',
			'show_in_rest'        => true, 
			'rest_base'           => 'home-categories',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
