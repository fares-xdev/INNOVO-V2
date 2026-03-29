<?php

namespace ProjectCore\Admin;

/**
 * Class OurPartnersMeta
 *
 * Handles metadata for the 'Our Partners' Custom Post Type.
 *
 * @package ProjectCore\Admin
 */
class OurPartnersMeta {

	/**
	 * Meta keys.
	 */
	const META_BRAND_ID    = '_partner_brand_id';
	const META_DESCRIPTION = '_partner_description';
	const META_LINK        = '_partner_link';
	const META_BG_IMAGE_ID = '_partner_bg_image_id';
	const META_ORDER       = '_partner_order';

	/**
	 * Add meta boxes.
	 */
	public function add_partner_meta_boxes() {
		add_meta_box(
			'partner_details',
			__( 'Partner Details', 'project-core' ),
			[ $this, 'render_partner_meta_box' ],
			'our-partners',
			'normal',
			'high'
		);
	}

	/**
	 * Enqueue Media Scripts for the Meta Box.
	 */
	public function enqueue_media_scripts( $hook ) {
		global $post;
		
		if ( $hook !== 'post.php' && $hook !== 'post-new.php' ) {
			return;
		}

		if ( ! $post || $post->post_type !== 'our-partners' ) {
			return;
		}

		wp_enqueue_media();
	}

	/**
	 * Render the meta box.
	 */
	public function render_partner_meta_box( $post ) {
		// Add nonce for security
		wp_nonce_field( 'save_partner_meta', 'partner_meta_nonce' );

		// Get current values
		$brand_id    = get_post_meta( $post->ID, self::META_BRAND_ID, true );
		$description = get_post_meta( $post->ID, self::META_DESCRIPTION, true );
		$link        = get_post_meta( $post->ID, self::META_LINK, true );
		$bg_image_id = get_post_meta( $post->ID, self::META_BG_IMAGE_ID, true );
		$order       = get_post_meta( $post->ID, self::META_ORDER, true );
		$bg_image_url = $bg_image_id ? wp_get_attachment_url( $bg_image_id ) : '';

		// Fetch Brands from WooCommerce (pa_brand taxonomy)
		$brands = get_terms( [
			'taxonomy'   => 'pa_brand',
			'hide_empty' => false,
		] );

		?>
		<table class="form-table">
			<tr>
				<th><label for="partner_brand_id"><?php _e( 'Select Brand Name', 'project-core' ); ?></label></th>
				<td>
					<select name="partner_brand_id" id="partner_brand_id" class="postbox" style="width: 100%; max-width: 400px;">
						<option value=""><?php _e( '-- Select a Brand --', 'project-core' ); ?></option>
						<?php if ( ! is_wp_error( $brands ) && ! empty( $brands ) ) : ?>
							<?php foreach ( $brands as $brand ) : ?>
								<option value="<?php echo esc_attr( $brand->term_id ); ?>" <?php selected( $brand_id, $brand->term_id ); ?>>
									<?php echo esc_html( $brand->name ); ?>
								</option>
							<?php endforeach; ?>
						<?php endif; ?>
					</select>
					<p class="description"><?php _e( 'The partner name is pulled from your existing WooCommerce brands.', 'project-core' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><label><?php _e( 'Background Image', 'project-core' ); ?></label></th>
				<td>
					<div id="partner_bg_image_preview" style="margin-bottom: 15px; background: #f0f0f0; width: 200px; height: 120px; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; overflow: hidden;">
						<?php if ( $bg_image_url ) : ?>
							<img src="<?php echo esc_url( $bg_image_url ); ?>" style="max-width: 100%; max-height: 100%;">
						<?php else : ?>
							<span style="color: #aaa;"><?php _e( 'No image selected', 'project-core' ); ?></span>
						<?php endif; ?>
					</div>
					<input type="hidden" name="partner_bg_image_id" id="partner_bg_image_id" value="<?php echo esc_attr( $bg_image_id ); ?>">
					<button type="button" class="button button-secondary" id="partner_bg_image_upload_btn"><?php _e( 'Select Background Image', 'project-core' ); ?></button>
					<button type="button" class="button button-link-delete" id="partner_bg_image_remove_btn" style="<?php echo ! $bg_image_url ? 'display:none;' : ''; ?>"><?php _e( 'Remove Image', 'project-core' ); ?></button>
				</td>
			</tr>
			<tr>
				<th><label for="partner_description"><?php _e( 'Description', 'project-core' ); ?></label></th>
				<td>
					<textarea name="partner_description" id="partner_description" rows="4" style="width: 100%; max-width: 400px;"><?php echo esc_textarea( $description ); ?></textarea>
				</td>
			</tr>
			<tr>
				<th><label for="partner_link"><?php _e( 'Partner Link (URL)', 'project-core' ); ?></label></th>
				<td>
					<input type="url" name="partner_link" id="partner_link" value="<?php echo esc_url( $link ); ?>" style="width: 100%; max-width: 400px;">
				</td>
			</tr>
			<tr>
				<th><label for="partner_order"><?php _e( 'Display Order', 'project-core' ); ?></label></th>
				<td>
					<input type="number" name="partner_order" id="partner_order" value="<?php echo esc_attr( $order ); ?>" style="width: 100px;">
					<p class="description"><?php _e( 'Enter a number (1, 2, 3...) to set the order on the site.', 'project-core' ); ?></p>
				</td>
			</tr>
		</table>

		<script>
			jQuery(document).ready(function($) {
				var frame;
				$('#partner_bg_image_upload_btn').on('click', function(e) {
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({
						title: 'Select Background Image',
						button: { text: 'Use this image' },
						multiple: false
					});
					frame.on('select', function() {
						var attachment = frame.state().get('selection').first().toJSON();
						$('#partner_bg_image_id').val(attachment.id);
						$('#partner_bg_image_preview').html('<img src="' + attachment.url + '" style="max-width: 100%; max-height: 100%;">');
						$('#partner_bg_image_remove_btn').show();
					});
					frame.open();
				});

				$('#partner_bg_image_remove_btn').on('click', function(e) {
					e.preventDefault();
					$('#partner_bg_image_id').val('');
					$('#partner_bg_image_preview').html('<span style="color: #aaa;">No image selected</span>');
					$(this).hide();
				});
			});
		</script>
		<?php
	}

	/**
	 * Save metadata.
	 */
	public function save_partner_metadata( $post_id ) {
		// Security checks
		if ( ! isset( $_POST['partner_meta_nonce'] ) || ! wp_verify_nonce( $_POST['partner_meta_nonce'], 'save_partner_meta' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		// Save fields
		if ( isset( $_POST['partner_brand_id'] ) ) {
			$brand_id = sanitize_text_field( $_POST['partner_brand_id'] );
			update_post_meta( $post_id, self::META_BRAND_ID, $brand_id );

			// Auto-update post title based on selected brand
			if ( ! empty( $brand_id ) ) {
				$brand = get_term( $brand_id, 'pa_brand' );
				if ( ! is_wp_error( $brand ) && $brand ) {
					// Unhook this function to avoid infinite loop
					remove_action( 'save_post', [ $this, 'save_partner_metadata' ] );
					wp_update_post( [
						'ID'         => $post_id,
						'post_title' => $brand->name,
					] );
					add_action( 'save_post', [ $this, 'save_partner_metadata' ] );
				}
			}
		}

		if ( isset( $_POST['partner_description'] ) ) {
			update_post_meta( $post_id, self::META_DESCRIPTION, sanitize_textarea_field( $_POST['partner_description'] ) );
		}

		if ( isset( $_POST['partner_link'] ) ) {
			update_post_meta( $post_id, self::META_LINK, esc_url_raw( $_POST['partner_link'] ) );
		}

		if ( isset( $_POST['partner_bg_image_id'] ) ) {
			update_post_meta( $post_id, self::META_BG_IMAGE_ID, sanitize_text_field( $_POST['partner_bg_image_id'] ) );
		}

		if ( isset( $_POST['partner_order'] ) ) {
			update_post_meta( $post_id, self::META_ORDER, sanitize_text_field( $_POST['partner_order'] ) );
		}
	}

	/**
	 * Expose metadata to REST API.
	 */
	public function register_rest_fields() {
		register_rest_field(
			'our-partners',
			'partner_details',
			[
				'get_callback' => function( $object ) {
					$post_id = $object['id'];
					$brand_id = get_post_meta( $post_id, self::META_BRAND_ID, true );
					$brand_name = '';
					
					if ( $brand_id ) {
						$brand = get_term( $brand_id, 'pa_brand' );
						if ( ! is_wp_error( $brand ) && $brand ) {
							$brand_name = $brand->name;
						}
					}

					$image_id = get_post_meta( $post_id, self::META_BG_IMAGE_ID, true );

					return [
						'brand_id'    => $brand_id,
						'brand_name'  => $brand_name,
						'description' => get_post_meta( $post_id, self::META_DESCRIPTION, true ),
						'link'        => get_post_meta( $post_id, self::META_LINK, true ),
						'background_image' => $image_id ? wp_get_attachment_url( $image_id ) : null,
						'order'       => (int) get_post_meta( $post_id, self::META_ORDER, true ),
					];
				}
			]
		);
	}
}
