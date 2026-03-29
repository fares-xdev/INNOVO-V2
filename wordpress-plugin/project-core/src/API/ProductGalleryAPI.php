<?php

namespace ProjectCore\API;

use ProjectCore\PostTypes\ProductGallery;
use ProjectCore\Admin\ProductGalleryMeta;
use WP_REST_Request;
use WP_REST_Response;

/**
 * REST API for Product Gallery.
 */
class ProductGalleryAPI {

	/**
	 * Namespace and route.
	 */
	protected $namespace = 'project-core/v1';
	protected $rest_base = 'home/product-gallery';

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
				'callback'            => [ $this, 'get_gallery_items' ],
				'permission_callback' => '__return_true',
			],
		] );
	}

	/**
	 * Fetch and format gallery items.
	 */
	public function get_gallery_items( WP_REST_Request $request ) {
		$args = [
			'post_type'      => ProductGallery::POST_TYPE,
			'post_status'    => 'publish',
			'posts_per_page' => 3,
			'meta_key'       => ProductGalleryMeta::META_ORDER,
			'orderby'        => 'meta_value_num',
			'order'          => 'ASC',
			'meta_query'     => [
				[
					'key'     => ProductGalleryMeta::META_IS_ACTIVE,
					'value'   => 'yes',
					'compare' => '=',
				],
			],
		];

		$query = new \WP_Query( $args );
		$data  = [];

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				$cat_id   = get_post_meta( $post->ID, ProductGalleryMeta::META_CATEGORY_ID, true );
				$image_id = get_post_meta( $post->ID, ProductGalleryMeta::META_CUSTOM_IMAGE, true );
				$order    = get_post_meta( $post->ID, ProductGalleryMeta::META_ORDER, true );

				$category = get_term( $cat_id, 'product_cat' );

				if ( is_wp_error( $category ) || ! $category ) {
					continue;
				}

				$data[] = [
					'id'    => $post->ID,
					'title' => $category->name,
					'slug'  => $category->slug,
					'image' => wp_get_attachment_url( $image_id ) ?: '',
					'link'  => '/products/' . $category->slug,
					'order' => (int) $order,
				];
			}
		}

		return new WP_REST_Response( [
			'status' => 'success',
			'data'   => $data,
		], 200 );
	}
}
