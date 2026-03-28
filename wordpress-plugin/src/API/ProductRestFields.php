<?php

namespace ProjectCore\API;

/**
 * Class ProductRestFields
 *
 * Exposes ACF download fields to the existing WordPress REST API endpoint:
 * /wp-json/wp/v2/product/{id}
 *
 * @package ProjectCore\API
 */
class ProductRestFields {

	/**
	 * Register the REST field.
	 */
	public function register_fields() {
		register_rest_field(
			'product',
			'downloads',
			[
				'get_callback'    => [ $this, 'get_downloads_field' ],
				'update_callback' => null,
				'schema'          => null,
			]
		);
	}

	/**
	 * Get callback for the downloads field.
	 *
	 * @param array           $object     The object from the response.
	 * @param string          $field_name The name of the field.
	 * @param \WP_REST_Request $request    The request object.
	 * @return array Array of downloads.
	 */
	public function get_downloads_field( $object, $field_name, $request ) {
		// Prevent errors if ACF is not active.
		if ( ! function_exists( 'get_field' ) ) {
			return [];
		}

		$post_id   = $object['id'];
		$downloads = [];

		$fields_to_check = [
			'downloads_technical_data_sheet' => 'Technical Data Sheet',
			'downloads_dwg_file'             => 'DWG File',
			'downloads_catalogue'            => 'Catalogue',
			'downloads_user_manual'          => 'User Manual',
			'downloads_certificat'           => 'Certificate',
			'downloads_finishes'             => 'Finishes',
			'downloads_images'               => 'Images',
			'downloads_video'                => 'Video',
		];

		foreach ( $fields_to_check as $acf_key => $label ) {
			$value = get_field( $acf_key, $post_id );

			// Ensure value is not empty and not an empty string.
			if ( ! empty( $value ) && is_string( $value ) && trim( $value ) !== '' ) {
				$downloads[] = [
					'label' => $label,
					'url'   => esc_url_raw( trim( $value ) ),
				];
			}
		}

		return $downloads;
	}
}
