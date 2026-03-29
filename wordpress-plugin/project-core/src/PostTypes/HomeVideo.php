<?php

namespace ProjectCore\PostTypes;

/**
 * Class HomeVideo
 *
 * Registers the 'home-video' custom post type for the dynamic home page video section.
 *
 * @package ProjectCore\PostTypes
 */
class HomeVideo {

	/**
	 * Register the custom post type.
	 */
	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Home Video', 'post type general name', 'project-core' ),
			'singular_name'      => _x( 'Home Video Segment', 'post type singular name', 'project-core' ),
			'menu_name'          => _x( 'Home Video', 'admin menu', 'project-core' ),
			'name_admin_bar'     => _x( 'Home Video', 'add new on admin bar', 'project-core' ),
			'add_new'            => _x( 'Add New Segment', 'home-video', 'project-core' ),
			'add_new_item'       => __( 'Add New Home Video Segment', 'project-core' ),
			'new_item'           => __( 'New Home Video Segment', 'project-core' ),
			'edit_item'          => __( 'Edit Home Video Segment', 'project-core' ),
			'view_item'          => __( 'View Segment', 'project-core' ),
			'all_items'          => __( 'All Segments', 'project-core' ),
			'search_items'       => __( 'Search Home Video', 'project-core' ),
			'not_found'          => __( 'No video segments found.', 'project-core' ),
			'not_found_in_trash' => __( 'No video segments found in Trash.', 'project-core' ),
		];

		$args = [
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => 'project-core',
			'query_var'          => true,
			'rewrite'            => [ 'slug' => 'home-video' ],
			'capability_type'    => 'post',
			'has_archive'        => false,
			'hierarchical'       => false,
			'menu_position'      => 35,
			'menu_icon'          => 'dashicons-video-alt3',
			'supports'           => [ 'title' ],
			'show_in_rest'       => true,
			'rest_base'          => 'home-video',
		];

		register_post_type( 'home-video', $args );
	}
}
