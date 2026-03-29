<?php

namespace ProjectCore\Admin;

use ProjectCore\PostTypes\ProductGallery;

/**
 * Handle Meta Boxes for Product Gallery.
 */
class ProductGalleryMeta {

	/**
	 * Meta keys.
	 */
	const META_CATEGORY_ID  = '_pc_product_category_id';
	const META_CUSTOM_IMAGE = '_pc_custom_image_id';
	const META_ORDER        = '_pc_display_order';
	const META_IS_ACTIVE    = '_pc_is_active';

	/**
	 * Initialize hooks.
	 */
	public function register() {
		add_action( 'add_meta_boxes', [ $this, 'add_gallery_meta_boxes' ] );
		add_action( 'save_post', [ $this, 'save_gallery_metadata' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_media_scripts' ] );
	}

	/**
	 * Enqueue WP Media scripts.
	 */
	public function enqueue_media_scripts( $hook ) {
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) return;
		if ( get_post_type() !== ProductGallery::POST_TYPE ) return;
		wp_enqueue_media();
	}

	/**
	 * Add Meta Box.
	 */
	public function add_gallery_meta_boxes() {
		add_meta_box(
			'pc_gallery_details',
			__( 'Gallery Item Details', 'project-core' ),
			[ $this, 'render_meta_box_html' ],
			ProductGallery::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Render HTML.
	 */
	public function render_meta_box_html( $post ) {
		wp_nonce_field( 'pc_save_gallery_meta', 'pc_gallery_nonce' );

		$category_id  = get_post_meta( $post->ID, self::META_CATEGORY_ID, true );
		$image_id     = get_post_meta( $post->ID, self::META_CUSTOM_IMAGE, true );
		$order        = get_post_meta( $post->ID, self::META_ORDER, true );
		$is_active    = get_post_meta( $post->ID, self::META_IS_ACTIVE, true );
		if ( '' === $is_active ) $is_active = 'yes';

		$categories = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => false ] );
		$image_url  = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : '';

		?>
		<style>
			.pc-meta-row { margin-bottom: 20px; }
			.pc-meta-row label { display: block; font-weight: bold; margin-bottom: 5px; }
			.pc-image-preview { width: 100px; height: 100px; border: 1px solid #ddd; background: #f9f9f9; margin-top: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
			.pc-image-preview img { max-width: 100%; height: auto; }
		</style>

		<div class="pc-meta-wrapper">
			<div class="pc-meta-row">
				<label><?php _e( 'Product Category', 'project-core' ); ?></label>
				<select name="pc_category_id" class="widefat">
					<option value=""><?php _e( 'Select Category', 'project-core' ); ?></option>
					<?php foreach ( $categories as $cat ) : ?>
						<option value="<?php echo esc_attr( $cat->term_id ); ?>" <?php selected( $category_id, $cat->term_id ); ?>>
							<?php echo esc_html( $cat->name ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</div>

			<div class="pc-meta-row">
				<label><?php _e( 'Custom Image', 'project-core' ); ?></label>
				<input type="hidden" id="pc_custom_image_id" name="pc_custom_image_id" value="<?php echo esc_attr( $image_id ); ?>">
				<div class="pc-image-preview" id="pc_image_preview">
					<?php if ( $image_url ) : ?>
						<img src="<?php echo esc_url( $image_url ); ?>" alt="">
					<?php else : ?>
						<span class="dashicons dashicons-format-image" style="font-size: 40px; color: #ccc;"></span>
					<?php endif; ?>
				</div>
				<p>
					<button type="button" class="button" id="pc_upload_image_btn"><?php _e( 'Choose Image', 'project-core' ); ?></button>
					<button type="button" class="button" id="pc_remove_image_btn"><?php _e( 'Remove', 'project-core' ); ?></button>
				</p>
			</div>

			<div class="pc-meta-row">
				<label><?php _e( 'Display Order', 'project-core' ); ?></label>
				<input type="number" name="pc_display_order" value="<?php echo esc_attr( $order ? $order : 0 ); ?>" class="small-text">
			</div>

			<div class="pc-meta-row">
				<label>
					<input type="checkbox" name="pc_is_active" value="yes" <?php checked( $is_active, 'yes' ); ?>>
					<?php _e( 'Is Active?', 'project-core' ); ?>
				</label>
			</div>
		</div>

		<script>
			jQuery(document).ready(function($){
				var frame;
				$('#pc_upload_image_btn').on('click', function(e){
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({ title: 'Select Image', button: { text: 'Use Image' }, multiple: false });
					frame.on('select', function(){
						var attachment = frame.state().get('selection').first().toJSON();
						$('#pc_custom_image_id').val(attachment.id);
						$('#pc_image_preview').html('<img src="'+attachment.sizes.thumbnail.url+'">');
					});
					frame.open();
				});
				$('#pc_remove_image_btn').on('click', function(){
					$('#pc_custom_image_id').val('');
					$('#pc_image_preview').html('<span class="dashicons dashicons-format-image" style="font-size: 40px; color: #ccc;"></span>');
				});
			});
		</script>
		<?php
	}

	/**
	 * Save Meta.
	 */
	public function save_gallery_metadata( $post_id ) {
		if ( ! isset( $_POST['pc_gallery_nonce'] ) || ! wp_verify_nonce( $_POST['pc_gallery_nonce'], 'pc_save_gallery_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['pc_category_id'] ) ) {
			update_post_meta( $post_id, self::META_CATEGORY_ID, absint( $_POST['pc_category_id'] ) );
		}

		if ( isset( $_POST['pc_custom_image_id'] ) ) {
			update_post_meta( $post_id, self::META_CUSTOM_IMAGE, absint( $_POST['pc_custom_image_id'] ) );
		}

		if ( isset( $_POST['pc_display_order'] ) ) {
			update_post_meta( $post_id, self::META_ORDER, intval( $_POST['pc_display_order'] ) );
		}

		$is_active = isset( $_POST['pc_is_active'] ) ? 'yes' : 'no';
		update_post_meta( $post_id, self::META_IS_ACTIVE, $is_active );
	}
}
