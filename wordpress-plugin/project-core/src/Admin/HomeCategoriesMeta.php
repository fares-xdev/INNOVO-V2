<?php

namespace ProjectCore\Admin;

use ProjectCore\PostTypes\HomeCategories;

/**
 * Handle Meta Boxes for Home Categories.
 */
class HomeCategoriesMeta {

	const META_CATEGORY_ID = '_pc_home_cat_id';
	const META_IMAGE_ID    = '_pc_home_cat_image_id';

	/**
	 * Register hooks.
	 */
	public function add_meta_boxes() {
		add_meta_box(
			'pc_home_categories_details',
			__( 'Category Details', 'project-core' ),
			[ $this, 'render_meta_box_html' ],
			HomeCategories::POST_TYPE,
			'normal',
			'high'
		);
	}

	/**
	 * Render HTML.
	 */
	public function render_meta_box_html( $post ) {
		wp_nonce_field( 'pc_save_home_cat_meta', 'pc_home_cat_nonce' );

		$category_id = get_post_meta( $post->ID, self::META_CATEGORY_ID, true );
		$image_id    = get_post_meta( $post->ID, self::META_IMAGE_ID, true );
		$image_url   = $image_id ? wp_get_attachment_image_url( $image_id, 'medium' ) : '';

		// Get all WC product categories for selection
		$wc_categories = get_terms([
			'taxonomy' => 'product_cat',
			'hide_empty' => false,
		]);

		?>
		<style>
			.pc-meta-row { margin-bottom: 25px; }
			.pc-meta-row label { display: block; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
			.pc-image-preview { width: 100%; max-width: 300px; height: 300px; border: 2px dashed #ccc; background: #fafafa; margin-top: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; }
			.pc-image-preview img { max-width: 100%; height: 100%; object-fit: contain; }
			.pc-image-preview span.dashicons { font-size: 80px; width: 80px; height: 80px; color: #ddd; }
		</style>

		<div class="pc-meta-wrapper">
			<div class="pc-meta-row">
				<label><?php _e( 'Link to WooCommerce Category', 'project-core' ); ?></label>
				<select name="pc_home_cat_id" style="width: 100%; max-width: 400px;">
					<option value=""><?php _e( '-- Select Category --', 'project-core' ); ?></option>
					<?php foreach ( $wc_categories as $cat ) : ?>
						<option value="<?php echo esc_attr( $cat->term_id ); ?>" <?php selected( $category_id, $cat->term_id ); ?>>
							<?php echo esc_html( $cat->name ); ?> (<?php echo $cat->count; ?>)
						</option>
					<?php endforeach; ?>
				</select>
				<p class="description"><?php _e( 'Select which WooCommerce category this slide represents.', 'project-core' ); ?></p>
			</div>

			<div class="pc-meta-row">
				<label><?php _e( '3D Pop-out Image', 'project-core' ); ?></label>
				<input type="hidden" id="pc_home_cat_image_id" name="pc_home_cat_image_id" value="<?php echo esc_attr( $image_id ); ?>">
				<div class="pc-image-preview" id="pc_home_cat_image_preview">
					<?php if ( $image_url ) : ?>
						<img src="<?php echo esc_url( $image_url ); ?>" alt="">
					<?php else : ?>
						<span class="dashicons dashicons-format-image"></span>
					<?php endif; ?>
				</div>
				<p>
					<button type="button" class="button button-primary" id="pc_home_cat_upload_btn"><?php _e( 'Choose 3D Image', 'project-core' ); ?></button>
					<button type="button" class="button" id="pc_home_cat_remove_btn"><?php _e( 'Remove', 'project-core' ); ?></button>
				</p>
				<p class="description"><?php _e( 'Upload a PNG with transparent background for the 3D effect.', 'project-core' ); ?></p>
			</div>
		</div>

		<script>
			jQuery(document).ready(function($){
				var frame;
				$('#pc_home_cat_upload_btn').on('click', function(e){
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({ title: 'Select 3D Image', button: { text: 'Use Image' }, multiple: false });
					frame.on('select', function(){
						var attachment = frame.state().get('selection').first().toJSON();
						$('#pc_home_cat_image_id').val(attachment.id);
						var imgUrl = attachment.sizes.medium ? attachment.sizes.medium.url : attachment.url;
						$('#pc_home_cat_image_preview').html('<img src="'+imgUrl+'">');
					});
					frame.open();
				});
				$('#pc_home_cat_remove_btn').on('click', function(){
					$('#pc_home_cat_image_id').val('');
					$('#pc_home_cat_image_preview').html('<span class="dashicons dashicons-format-image"></span>');
				});
			});
		</script>
		<?php
	}

	/**
	 * Save Meta.
	 */
	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['pc_home_cat_nonce'] ) || ! wp_verify_nonce( $_POST['pc_home_cat_nonce'], 'pc_save_home_cat_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['pc_home_cat_id'] ) ) {
			update_post_meta( $post_id, self::META_CATEGORY_ID, absint( $_POST['pc_home_cat_id'] ) );
		}

		if ( isset( $_POST['pc_home_cat_image_id'] ) ) {
			update_post_meta( $post_id, self::META_IMAGE_ID, absint( $_POST['pc_home_cat_image_id'] ) );
		}
	}

	/**
	 * Register REST Fields.
	 */
	public function register_rest_fields() {
		// Category Details (ID, Name, Slug, Link, Count)
		register_rest_field(
			HomeCategories::POST_TYPE,
			'category_details',
			[
				'get_callback' => function( $post_array ) {
					$cat_id = get_post_meta( $post_array['id'], self::META_CATEGORY_ID, true );
					if ( ! $cat_id ) return null;

					$term = get_term( $cat_id, 'product_cat' );
					if ( is_wp_error( $term ) || ! $term ) return null;

					return [
						'id'    => $term->term_id,
						'name'  => $term->name,
						'slug'  => $term->slug,
						'count' => $term->count,
						'link'  => get_term_link( $term ),
					];
				},
				'schema' => null,
			]
		);

		// 3D Image URL
		register_rest_field(
			HomeCategories::POST_TYPE,
			'custom_image',
			[
				'get_callback' => function( $post_array ) {
					$image_id = get_post_meta( $post_array['id'], self::META_IMAGE_ID, true );
					if ( ! $image_id ) {
						// Fallback to WC category image if no custom image
						$cat_id = get_post_meta( $post_array['id'], self::META_CATEGORY_ID, true );
						if ( $cat_id ) {
							$thumbnail_id = get_term_meta( $cat_id, 'thumbnail_id', true );
							if ( $thumbnail_id ) {
								return wp_get_attachment_image_url( $thumbnail_id, 'full' );
							}
						}
						return null;
					}
					return wp_get_attachment_image_url( $image_id, 'full' );
				},
				'schema' => null,
			]
		);
	}

	/**
	 * Enqueue Scripts.
	 */
	public function enqueue_media_scripts( $hook ) {
		if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) return;
		if ( get_post_type() !== HomeCategories::POST_TYPE ) return;
		wp_enqueue_media();
	}
}
