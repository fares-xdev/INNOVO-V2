<?php

namespace ProjectCore\PostTypes;

/**
 * Register Product Gallery Custom Post Type.
 *
 * @package ProjectCore\PostTypes
 */
class ProductGallery {

	/**
	 * Post type slug.
	 */
	const POST_TYPE = 'product_gallery';

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
			'name'               => _x( 'Product Gallery', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Gallery Item', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Product Gallery', 'project-core' ),
			'all_items'          => __( 'All Items', 'project-core' ),
			'add_new_item'       => __( 'Add New Gallery Item', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'edit_item'          => __( 'Edit Item', 'project-core' ),
			'update_item'        => __( 'Update Item', 'project-core' ),
			'search_items'       => __( 'Search Items', 'project-core' ),
			'not_found'          => __( 'Not Found', 'project-core' ),
			'not_found_in_trash' => __( 'Not found in Trash', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Product Gallery', 'project-core' ),
			'description'         => __( 'Home section product category gallery', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title' ],
			'hierarchical'        => false,
			'public'              => false,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 30,
			'show_in_admin_bar'   => true,
			'show_in_nav_menus'   => false,
			'can_export'          => true,
			'has_archive'         => false,
			'exclude_from_search' => true,
			'publicly_queryable'  => false,
			'capability_type'     => 'post',
			'show_in_rest'        => false,
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
