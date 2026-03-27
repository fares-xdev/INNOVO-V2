<?php

namespace ProjectCore\PostTypes;

/**
 * Class SocialLinks
 *
 * Registers the 'Social Links' Custom Post Type.
 *
 * @package ProjectCore\PostTypes
 */
class SocialLinks {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'social-links';

	/**
	 * Register the post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Social Links', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Social Link', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Social Links', 'project-core' ),
			'all_items'          => __( 'All Social Links', 'project-core' ),
			'add_new_item'       => __( 'Add New Social Link', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'new_item'           => __( 'New Social Link', 'project-core' ),
			'edit_item'          => __( 'Edit Social Link', 'project-core' ),
			'update_item'        => __( 'Update Social Link', 'project-core' ),
			'view_item'          => __( 'View Social Link', 'project-core' ),
			'search_items'       => __( 'Search Social Links', 'project-core' ),
			'not_found'          => __( 'No social links found', 'project-core' ),
			'not_found_in_trash' => __( 'No social links found in Trash', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Social Links', 'project-core' ),
			'description'         => __( 'Social media links for the company', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title' ], 
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core', // Show under Project Core menu
			'menu_icon'           => 'dashicons-share',
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => true,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => true,
			'capability_type'     => 'post',
			'show_in_rest'        => true, // Enable REST API
			'rest_base'           => 'social-links',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
