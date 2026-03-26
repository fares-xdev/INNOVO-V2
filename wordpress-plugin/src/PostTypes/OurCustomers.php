<?php

namespace ProjectCore\PostTypes;

/**
 * Class OurCustomers
 *
 * Registers the 'Our Customers' Custom Post Type.
 *
 * @package ProjectCore\PostTypes
 */
class OurCustomers {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'our-customers';

	/**
	 * Register the post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Our Customers', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Customer', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Our Customers', 'project-core' ),
			'all_items'          => __( 'All Customers', 'project-core' ),
			'add_new_item'       => __( 'Add New Customer', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'new_item'           => __( 'New Customer', 'project-core' ),
			'edit_item'          => __( 'Edit Customer', 'project-core' ),
			'update_item'        => __( 'Update Customer', 'project-core' ),
			'view_item'          => __( 'View Customer', 'project-core' ),
			'search_items'       => __( 'Search Customers', 'project-core' ),
			'not_found'          => __( 'No customers found', 'project-core' ),
			'not_found_in_trash' => __( 'No customers found in Trash', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Our Customers', 'project-core' ),
			'description'         => __( 'Customer logos for the home page slider', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title', 'thumbnail' ], 
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => null,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'show_in_rest'        => true, 
			'rest_base'           => 'our-customers',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
