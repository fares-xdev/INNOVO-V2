<?php

namespace ProjectCore\API;

use ProjectCore\PostTypes\HomeSlider;
use ProjectCore\Admin\HomeSliderMeta;
use WP_REST_Request;
use WP_REST_Response;

/**
 * REST API for Home Slider.
 * 
 * Provides a clean JSON response for the headless frontend (React).
 */
class HomeSliderAPI {

	/**
	 * Namespace and route.
	 */
	protected $namespace = 'project-core/v1';
	protected $rest_base = 'home/slider';

	/**
	 * Register routes.
	 */
	public function register() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/**
	 * Register the REST route.
	 */
	public function register_routes() {
		register_rest_route( $this->namespace, '/' . $this->rest_base, [
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_slides' ],
				'permission_callback' => '__return_true',
			],
		] );
	}

	/**
	 * Fetch and format active slides.
	 */
	public function get_slides( WP_REST_Request $request ) {
		$args = [
			'post_type'      => HomeSlider::POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => -1, // Unlimited slides as requested
			'meta_key'       => HomeSliderMeta::META_ORDER,
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
			'meta_query'     => [
				[
					'key'     => HomeSliderMeta::META_IS_ACTIVE,
					'value'   => 'yes',
					'compare' => '=',
				],
			],
		];

		$query = new \WP_Query( $args );
		$data  = [];

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				$image_id    = get_post_meta( $post->ID, HomeSliderMeta::META_IMAGE, true );
				$description = get_post_meta( $post->ID, HomeSliderMeta::META_DESCRIPTION, true );
				$order       = get_post_meta( $post->ID, HomeSliderMeta::META_ORDER, true );

				// Validate image exists before adding to response
				$image_url = wp_get_attachment_url( $image_id );
				if ( ! $image_url ) {
					continue;
				}

				$data[] = [
					'id'          => $post->ID,
					'title'       => get_the_title( $post->ID ),
					'description' => $description,
					'image'       => $image_url,
					'order'       => (int) $order,
				];
			}
		}

		return new WP_REST_Response( [
			'status' => 'success',
			'data'   => $data,
		], 200 );
	}
}
