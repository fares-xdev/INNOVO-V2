<?php

namespace ProjectCore\PostTypes;

/**
 * Class OurPartnersSlider
 *
 * Registers the 'Our Partners' (Logo Slider) Custom Post Type.
 */
class OurPartnersSlider {

	const POST_TYPE = 'partners-slider';

	public function register_post_type() {
		$labels = [
			'name'               => _x( 'Our Partners Slider', 'Post Type General Name', 'project-core' ),
			'singular_name'      => _x( 'Partner Slider', 'Post Type Singular Name', 'project-core' ),
			'menu_name'          => __( 'Our Partners Slider', 'project-core' ),
			'all_items'          => __( 'All Partner Sliders', 'project-core' ),
			'add_new_item'       => __( 'Add New Partner Slider', 'project-core' ),
			'add_new'            => __( 'Add New', 'project-core' ),
			'edit_item'          => __( 'Edit Partner Slider', 'project-core' ),
			'update_item'        => __( 'Update Partner Slider', 'project-core' ),
			'view_item'          => __( 'View Partner Slider', 'project-core' ),
			'not_found'          => __( 'No sliders found', 'project-core' ),
		];

		$args = [
			'label'               => __( 'Our Partners Slider', 'project-core' ),
			'description'         => __( 'Logo slider for Partners', 'project-core' ),
			'labels'              => $labels,
			'supports'            => [ 'title' ], 
			'hierarchical'        => false,
			'public'              => true,
			'show_ui'             => true,
			'show_in_menu'        => 'project-core',
			'menu_position'       => 30,
			'menu_icon'           => 'dashicons-groups',
			'show_in_rest'        => true, 
			'rest_base'           => 'partners-slider',
		];

		register_post_type( self::POST_TYPE, $args );
	}
}
