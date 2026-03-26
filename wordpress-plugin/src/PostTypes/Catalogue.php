<?php

namespace ProjectCore\PostTypes;

/**
 * Class Catalogue
 *
 * Registers the 'Catalogue' Custom Post Type.
 *
 * @package ProjectCore\PostTypes
 */
class Catalogue {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'catalogue';

	/**
	 * Register the post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Catalogues', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Catalogue', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Catalogues', 'project-core' ),
			'all_items'          => __( 'All Catalogues', 'project-core' ),
			'add_new_item'       => __( 'Add New Catalogue', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'new_item'           => __( 'New Catalogue', 'project-core' ),
			'edit_item'          => __( 'Edit Catalogue', 'project-core' ),
			'update_item'        => __( 'Update Catalogue', 'project-core' ),
			'view_item'          => __( 'View Catalogue', 'project-core' ),
			'search_items'       => __( 'Search Catalogues', 'project-core' ),
			'not_found'          => __( 'No catalogues found', 'project-core' ),
			'not_found_in_trash' => __( 'No catalogues found in Trash', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Catalogues', 'project-core' ),
			'description'         => __( 'Brand Catalogues with PDF downloads', 'project-core' ),
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
			'rest_base'           => 'catalogues',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
