<?php

namespace ProjectCore\PostTypes;

/**
 * Class OurPartners
 *
 * Registers the 'Our Partners' Custom Post Type.
 *
 * @package ProjectCore\PostTypes
 */
class OurPartners {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'our-partners';

	/**
	 * Register the post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Our Partners', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Partner', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Our Partners', 'project-core' ),
			'all_items'          => __( 'All Partners', 'project-core' ),
			'add_new_item'       => __( 'Add New Partner', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'new_item'           => __( 'New Partner', 'project-core' ),
			'edit_item'          => __( 'Edit Partner', 'project-core' ),
			'update_item'        => __( 'Update Partner', 'project-core' ),
			'view_item'          => __( 'View Partner', 'project-core' ),
			'search_items'       => __( 'Search Partners', 'project-core' ),
			'not_found'          => __( 'No partners found', 'project-core' ),
			'not_found_in_trash' => __( 'No partners found in Trash', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Our Partners', 'project-core' ),
			'description'         => __( 'Partners and Brands of the company', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title', 'thumbnail' ], // Added title for better admin experience
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 31,
			'menu_icon'           => 'dashicons-groups',
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => false,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'show_in_rest'        => true, // Enable REST API
			'rest_base'           => 'our-partners',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
