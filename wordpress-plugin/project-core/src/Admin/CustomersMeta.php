<?php

namespace ProjectCore\Admin;

/**
 * Class CustomersMeta
 *
 * Handles professional gallery metadata for 'Our Customers' CPT.
 */
class CustomersMeta {

	const META_GALLERY = '_customer_gallery_ids';

	public function add_meta_boxes() {
		add_meta_box(
			'customer_gallery',
			__( 'Customer Logos Gallery', 'project-core' ),
			[ $this, 'render_gallery_meta_box' ],
			'our-customers',
			'normal',
			'high'
		);
	}

	public function enqueue_media_scripts( $hook ) {
		global $post;
		if ( ( $hook === 'post.php' || $hook === 'post-new.php' ) && $post && $post->post_type === 'our-customers' ) {
			wp_enqueue_media();
		}
	}

	public function render_gallery_meta_box( $post ) {
		wp_nonce_field( 'save_customers_meta', 'customers_meta_nonce' );
		$gallery_ids = get_post_meta( $post->ID, self::META_GALLERY, true );
		$ids_array = !empty($gallery_ids) ? explode(',', $gallery_ids) : [];
		?>
		<div id="customers_gallery_container">
			<ul id="customers_gallery_list" style="display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin-bottom: 15px;">
				<?php foreach ( $ids_array as $id ) : 
					$url = wp_get_attachment_thumb_url( $id );
					if ( $url ) : ?>
						<li data-id="<?php echo esc_attr($id); ?>" style="position: relative; border: 1px solid #ccc; padding: 5px; background: #fff;">
							<img src="<?php echo esc_url($url); ?>" style="width: 80px; height: 80px; object-contain: center;">
							<a href="#" class="remove-customer-img" style="position: absolute; top: -5px; right: -5px; background: red; color: #fff; border-radius: 50%; width: 18px; height: 18px; text-align: center; font-size: 12px; text-decoration: none; line-height: 16px;">&times;</a>
						</li>
					<?php endif;
				endforeach; ?>
			</ul>
			<input type="hidden" name="customer_gallery_ids" id="customer_gallery_ids" value="<?php echo esc_attr($gallery_ids); ?>">
			<button type="button" class="button button-primary" id="add_customers_btn"><?php _e( 'Add/Manage Logos', 'project-core' ); ?></button>
		</div>

		<script>
			jQuery(document).ready(function($) {
				var frame;
				$('#add_customers_btn').on('click', function(e) {
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({
						title: 'Select Customer Logos',
						button: { text: 'Add to Gallery' },
						multiple: true
					});
					frame.on('select', function() {
						var selection = frame.state().get('selection');
						var ids = $('#customer_gallery_ids').val() ? $('#customer_gallery_ids').val().split(',') : [];
						
						selection.map(function(attachment) {
							attachment = attachment.toJSON();
							if (ids.indexOf(attachment.id.toString()) === -1) {
								ids.push(attachment.id);
								$('#customers_gallery_list').append(
									'<li data-id="' + attachment.id + '" style="position: relative; border: 1px solid #ccc; padding: 5px; background: #fff;">' +
									'<img src="' + (attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url) + '" style="width: 80px; height: 80px; object-fit: contain;">' +
									'<a href="#" class="remove-customer-img" style="position: absolute; top: -5px; right: -5px; background: red; color: #fff; border-radius: 50%; width: 18px; height: 18px; text-align: center; font-size: 12px; text-decoration: none; line-height: 16px;">&times;</a>' +
									'</li>'
								);
							}
						});
						$('#customer_gallery_ids').val(ids.join(','));
					});
					frame.open();
				});

				$(document).on('click', '.remove-customer-img', function(e) {
					e.preventDefault();
					var li = $(this).closest('li');
					var id = li.attr('data-id');
					var ids = $('#customer_gallery_ids').val().split(',');
					ids = ids.filter(function(v) { return v != id; });
					$('#customer_gallery_ids').val(ids.join(','));
					li.remove();
				});
			});
		</script>
		<?php
	}

	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['customers_meta_nonce'] ) || ! wp_verify_nonce( $_POST['customers_meta_nonce'], 'save_customers_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['customer_gallery_ids'] ) ) {
			update_post_meta( $post_id, self::META_GALLERY, sanitize_text_field( $_POST['customer_gallery_ids'] ) );
		}
	}

	public function register_rest_fields() {
		register_rest_field(
			'our-customers',
			'logos_gallery',
			[
				'get_callback' => function( $object ) {
					$ids = get_post_meta( $object['id'], self::META_GALLERY, true );
					if ( empty($ids) ) return [];
					$ids_array = explode(',', $ids);
					$gallery = [];
					foreach ( $ids_array as $id ) {
						$url = wp_get_attachment_url( $id );
						if ( $url ) {
							$gallery[] = [
								'id' => $id,
								'url' => $url,
								'title' => get_the_title($id)
							];
						}
					}
					return $gallery;
				}
			]
		);
	}
}
