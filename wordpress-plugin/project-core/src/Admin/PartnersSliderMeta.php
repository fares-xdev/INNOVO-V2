<?php

namespace ProjectCore\Admin;

/**
 * Class PartnersSliderMeta
 *
 * Gallery metadata for 'Partners Slider' CPT.
 */
class PartnersSliderMeta {

	const META_GALLERY = '_partner_slider_gallery_ids';

	public function add_meta_boxes() {
		add_meta_box(
			'partner_slider_gallery',
			__( 'Partner Logos Gallery', 'project-core' ),
			[ $this, 'render_gallery_meta_box' ],
			'partners-slider',
			'normal',
			'high'
		);
	}

	public function enqueue_media_scripts( $hook ) {
		global $post;
		if ( ( $hook === 'post.php' || $hook === 'post-new.php' ) && $post && $post->post_type === 'partners-slider' ) {
			wp_enqueue_media();
		}
	}

	public function render_gallery_meta_box( $post ) {
		wp_nonce_field( 'save_partners_slider_meta', 'partners_slider_meta_nonce' );
		$gallery_ids = get_post_meta( $post->ID, self::META_GALLERY, true );
		$ids_array = !empty($gallery_ids) ? explode(',', $gallery_ids) : [];
		?>
		<div id="partners_gallery_container">
			<ul id="partners_gallery_list" style="display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; margin-bottom: 15px;">
				<?php foreach ( $ids_array as $id ) : 
					$url = wp_get_attachment_thumb_url( $id );
					if ( $url ) : ?>
						<li data-id="<?php echo esc_attr($id); ?>" style="position: relative; border: 1px solid #ccc; padding: 5px; background: #fff;">
							<img src="<?php echo esc_url($url); ?>" style="width: 80px; height: 80px; object-fit: contain;">
							<a href="#" class="remove-partner-img" style="position: absolute; top: -5px; right: -5px; background: red; color: #fff; border-radius: 50%; width: 18px; height: 18px; text-align: center; font-size: 12px; text-decoration: none; line-height: 16px;">&times;</a>
						</li>
					<?php endif;
				endforeach; ?>
			</ul>
			<input type="hidden" name="partner_gallery_ids" id="partner_gallery_ids" value="<?php echo esc_attr($gallery_ids); ?>">
			<button type="button" class="button button-primary" id="add_partners_btn"><?php _e( 'Add/Manage Logos', 'project-core' ); ?></button>
		</div>

		<script>
			jQuery(document).ready(function($) {
				var frame;
				$('#add_partners_btn').on('click', function(e) {
					e.preventDefault();
					if (frame) { frame.open(); return; }
					frame = wp.media({
						title: 'Select Partner Logos',
						button: { text: 'Add to Gallery' },
						multiple: true
					});
					frame.on('select', function() {
						var selection = frame.state().get('selection');
						var ids = $('#partner_gallery_ids').val() ? $('#partner_gallery_ids').val().split(',') : [];
						
						selection.map(function(attachment) {
							attachment = attachment.toJSON();
							if (ids.indexOf(attachment.id.toString()) === -1) {
								ids.push(attachment.id);
								$('#partners_gallery_list').append(
									'<li data-id="' + attachment.id + '" style="position: relative; border: 1px solid #ccc; padding: 5px; background: #fff;">' +
									'<img src="' + (attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url) + '" style="width: 80px; height: 80px; object-fit: contain;">' +
									'<a href="#" class="remove-partner-img" style="position: absolute; top: -5px; right: -5px; background: red; color: #fff; border-radius: 50%; width: 18px; height: 18px; text-align: center; font-size: 12px; text-decoration: none; line-height: 16px;">&times;</a>' +
									'</li>'
								);
							}
						});
						$('#partner_gallery_ids').val(ids.join(','));
					});
					frame.open();
				});

				$(document).on('click', '.remove-partner-img', function(e) {
					e.preventDefault();
					var li = $(this).closest('li');
					var id = li.attr('data-id');
					var ids = $('#partner_gallery_ids').val().split(',');
					ids = ids.filter(function(v) { return v != id; });
					$('#partner_gallery_ids').val(ids.join(','));
					li.remove();
				});
			});
		</script>
		<?php
	}

	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['partners_slider_meta_nonce'] ) || ! wp_verify_nonce( $_POST['partners_slider_meta_nonce'], 'save_partners_slider_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['partner_gallery_ids'] ) ) {
			update_post_meta( $post_id, self::META_GALLERY, sanitize_text_field( $_POST['partner_gallery_ids'] ) );
		}
	}

	public function register_rest_fields() {
		register_rest_field(
			'partners-slider',
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
