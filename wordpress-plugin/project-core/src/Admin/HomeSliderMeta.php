<?php

namespace ProjectCore\Admin;

use ProjectCore\PostTypes\HomeSlider;

/**
 * Handle Meta Boxes for Home Slider.
 * 
 * Manages custom fields for slides: image, description, order, and active status.
 */
class HomeSliderMeta {

	/**
	 * Meta keys.
	 */
	const META_IMAGE       = '_pc_slider_image_id';
	const META_DESCRIPTION = '_pc_slider_description';
	const META_ORDER       = '_pc_slider_display_order';
	const META_IS_ACTIVE   = '_pc_slider_is_active';

	/**
	 * Initialize hooks.
	 */
	public function register() {
		add_action( 'add_meta_boxes', [ $this, 'add_slider_meta_boxes' ] );
		add_action( 'save_post', [ $this, 'save_slider_metadata' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_media_scripts' ] );
	}

	/**
	 * Enqueue WP Media scripts.
	 */
	public function enqueue_media_scripts( $hook ) {
		if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) return;
		if ( get_post_type() !== HomeSlider::POST_TYPE ) return;
		wp_enqueue_media();
	}

	/**
	 * Add Meta Box.
	 */
	public function add_slider_meta_boxes() {
		add_meta_box(
			'pc_slider_details',
			__( 'Slide Details', 'project-core' ),
			[ $this, 'render_meta_box_html' ],
			HomeSlider::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Render HTML.
	 */
	public function render_meta_box_html( $post ) {
		wp_nonce_field( 'pc_save_slider_meta', 'pc_slider_nonce' );

		$image_id    = get_post_meta( $post->ID, self::META_IMAGE, true );
		$description = get_post_meta( $post->ID, self::META_DESCRIPTION, true );
		$order       = get_post_meta( $post->ID, self::META_ORDER, true );
		$is_active   = get_post_meta( $post->ID, self::META_IS_ACTIVE, true );
		
		if ( '' === $is_active ) $is_active = 'yes'; // Default to active

		$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';

		?>
		<style>
			.pc-meta-row { margin-bottom: 20px; }
			.pc-meta-row label { display: block; font-weight: bold; margin-bottom: 5px; }
			.pc-image-preview { width: 100%; max-width: 400px; min-height: 150px; border: 1px solid #ddd; background: #f9f9f9; margin-top: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
			.pc-image-preview img { max-width: 100%; height: auto; display: block; }
		</style>

		<div class="pc-meta-wrapper">
			<div class="pc-meta-row">
				<label><?php _e( 'Slide Image', 'project-core' ); ?></label>
				<input type="hidden" id="pc_slider_image_id" name="pc_slider_image_id" value="<?php echo esc_attr( $image_id ); ?>">
				<div class="pc-image-preview" id="pc_slider_image_preview">
					<?php if ( $image_url ) : ?>
						<img src="<?php echo esc_url( $image_url ); ?>" alt="">
					<?php else : ?>
						<span class="dashicons dashicons-format-image" style="font-size: 60px; color: #ccc;"></span>
					<?php endif; ?>
				</div>
				<p>
					<button type="button" class="button" id="pc_slider_upload_btn"><?php _e( 'Choose Image', 'project-core' ); ?></button>
					<button type="button" class="button" id="pc_slider_remove_btn"><?php _e( 'Remove', 'project-core' ); ?></button>
				</p>
			</div>

			<div class="pc-meta-row">
				<label><?php _e( 'Slide Description', 'project-core' ); ?></label>
				<textarea name="pc_slider_description" class="widefat" rows="4"><?php echo esc_textarea( $description ); ?></textarea>
			</div>

			<div class="pc-meta-row">
				<label><?php _e( 'Display Order', 'project-core' ); ?></label>
				<input type="number" name="pc_slider_order" value="<?php echo esc_attr( $order ? $order : 0 ); ?>" class="small-text">
			</div>

			<div class="pc-meta-row">
				<label>
					<input type="checkbox" name="pc_slider_active" value="yes" <?php checked( $is_active, 'yes' ); ?>>
					<?php _e( 'Is Active?', 'project-core' ); ?>
				</label>
			</div>
		</div>

		<script>
			jQuery(document).ready(function($){
				var frame;
				$('#pc_slider_upload_btn').on('click', function(e){
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({ title: 'Select Slide Image', button: { text: 'Use Image' }, multiple: false });
					frame.on('select', function(){
						var attachment = frame.state().get('selection').first().toJSON();
						$('#pc_slider_image_id').val(attachment.id);
						var imgUrl = attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url;
						$('#pc_slider_image_preview').html('<img src="'+imgUrl+'">');
					});
					frame.open();
				});
				$('#pc_slider_remove_btn').on('click', function(){
					$('#pc_slider_image_id').val('');
					$('#pc_slider_image_preview').html('<span class="dashicons dashicons-format-image" style="font-size: 60px; color: #ccc;"></span>');
				});
			});
		</script>
		<?php
	}

	/**
	 * Save Meta.
	 */
	public function save_slider_metadata( $post_id ) {
		if ( ! isset( $_POST['pc_slider_nonce'] ) || ! wp_verify_nonce( $_POST['pc_slider_nonce'], 'pc_save_slider_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['pc_slider_image_id'] ) ) {
			update_post_meta( $post_id, self::META_IMAGE, absint( $_POST['pc_slider_image_id'] ) );
		}

		if ( isset( $_POST['pc_slider_description'] ) ) {
			update_post_meta( $post_id, self::META_DESCRIPTION, sanitize_textarea_field( $_POST['pc_slider_description'] ) );
		}

		if ( isset( $_POST['pc_slider_order'] ) ) {
			update_post_meta( $post_id, self::META_ORDER, intval( $_POST['pc_slider_order'] ) );
		}

		$is_active = isset( $_POST['pc_slider_active'] ) ? 'yes' : 'no';
		update_post_meta( $post_id, self::META_IS_ACTIVE, $is_active );
	}
}
