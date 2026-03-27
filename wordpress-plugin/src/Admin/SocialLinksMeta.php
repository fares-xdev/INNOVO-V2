<?php

namespace ProjectCore\Admin;

/**
 * Class SocialLinksMeta
 *
 * Handles metadata for the 'Social Links' Custom Post Type.
 *
 * @package ProjectCore\Admin
 */
class SocialLinksMeta {

	/**
	 * Meta keys.
	 */
	const META_URL  = '_social_url';
	const META_ICON = '_social_icon';

	/**
	 * Add meta boxes.
	 */
	public function add_meta_boxes() {
		add_meta_box(
			'social_link_details',
			__( 'Social Media Details', 'project-core' ),
			[ $this, 'render_meta_box' ],
			'social-links',
			'normal',
			'high'
		);
	}

	/**
	 * Render the meta box.
	 */
	public function render_meta_box( $post ) {
		wp_nonce_field( 'save_social_link_meta', 'social_link_meta_nonce' );

		$url  = get_post_meta( $post->ID, self::META_URL, true );
		$icon = get_post_meta( $post->ID, self::META_ICON, true );

		$icons = [
			'facebook'  => 'Facebook',
			'instagram' => 'Instagram',
			'linkedin'  => 'LinkedIn',
			'twitter'   => 'Twitter (X)',
			'youtube'   => 'YouTube',
			'behance'   => 'Behance',
			'pinterest' => 'Pinterest',
			'whatsapp'  => 'WhatsApp',
		];

		?>
		<table class="form-table">
			<tr>
				<th><label for="social_icon"><?php _e( 'Platform Icon', 'project-core' ); ?></label></th>
				<td>
					<select name="social_icon" id="social_icon" style="width: 100%; max-width: 400px;">
						<option value=""><?php _e( '-- Select Platform --', 'project-core' ); ?></option>
						<?php foreach ( $icons as $value => $label ) : ?>
							<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $icon, $value ); ?>>
								<?php echo esc_html( $label ); ?>
							</option>
						<?php endforeach; ?>
					</select>
				</td>
			</tr>
			<tr>
				<th><label for="social_url"><?php _e( 'Profile URL', 'project-core' ); ?></label></th>
				<td>
					<input type="url" name="social_url" id="social_url" value="<?php echo esc_url( $url ); ?>" style="width: 100%; max-width: 400px;" placeholder="https://facebook.com/your-page">
				</td>
			</tr>
		</table>
		<?php
	}

	/**
	 * Save metadata.
	 */
	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['social_link_meta_nonce'] ) || ! wp_verify_nonce( $_POST['social_link_meta_nonce'], 'save_social_link_meta' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		if ( isset( $_POST['social_icon'] ) ) {
			update_post_meta( $post_id, self::META_ICON, sanitize_text_field( $_POST['social_icon'] ) );
		}

		if ( isset( $_POST['social_url'] ) ) {
			update_post_meta( $post_id, self::META_URL, esc_url_raw( $_POST['social_url'] ) );
		}
	}

	/**
	 * Expose to REST API.
	 */
	public function register_rest_fields() {
		register_rest_field(
			'social-links',
			'social_details',
			[
				'get_callback' => function( $object ) {
					$post_id = $object['id'];
					return [
						'icon' => get_post_meta( $post_id, self::META_ICON, true ),
						'url'  => get_post_meta( $post_id, self::META_URL, true ),
					];
				}
			]
		);
	}
}
