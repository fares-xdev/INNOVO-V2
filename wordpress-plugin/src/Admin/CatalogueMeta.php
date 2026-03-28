<?php

namespace ProjectCore\Admin;

/**
 * Class CatalogueMeta
 *
 * Handles metadata for the 'Catalogue' Custom Post Type.
 *
 * @package ProjectCore\Admin
 */
class CatalogueMeta {

	/**
	 * Meta keys.
	 */
	const META_PDF_IDS    = '_catalogue_pdf_ids';
	const META_BRAND_NAME = '_catalogue_brand_name';
	const META_DESC       = '_catalogue_description';

	/**
	 * Add meta boxes.
	 */
	public function add_meta_boxes() {
		add_meta_box(
			'catalogue_details',
			__( 'Catalogue Details', 'project-core' ),
			[ $this, 'render_meta_box' ],
			'catalogue',
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

		if ( ! $post || $post->post_type !== 'catalogue' ) {
			return;
		}

		wp_enqueue_media();
	}

	/**
	 * Render the meta box.
	 */
	public function render_meta_box( $post ) {
		wp_nonce_field( 'save_catalogue_meta', 'catalogue_meta_nonce' );

		$pdf_ids    = get_post_meta( $post->ID, self::META_PDF_IDS, true );
		$brand_name = get_post_meta( $post->ID, self::META_BRAND_NAME, true );
		$desc       = get_post_meta( $post->ID, self::META_DESC, true );
		
		$pdfs = $pdf_ids ? explode( ',', $pdf_ids ) : [];

		?>
		<style>
			.pdf-item {
				display: flex;
				align-items: center;
				padding: 10px;
				background: #f9f9f9;
				border: 1px solid #ddd;
				margin-bottom: 5px;
				border-radius: 4px;
			}
			.pdf-item .dashicons {
				margin-right: 10px;
				color: #d63638;
			}
			.pdf-item .remove-pdf {
				margin-left: auto;
				color: #a00;
				cursor: pointer;
				text-decoration: none;
			}
		</style>
		<table class="form-table">
			<tr>
				<th><label for="catalogue_brand_name"><?php _e( 'Brand Name', 'project-core' ); ?></label></th>
				<td>
					<input type="text" name="catalogue_brand_name" id="catalogue_brand_name" value="<?php echo esc_attr( $brand_name ); ?>" class="regular-text" placeholder="e.g. Interstuhl">
				</td>
			</tr>
			<tr>
				<th><label for="catalogue_description"><?php _e( 'Top Description', 'project-core' ); ?></label></th>
				<td>
					<input type="text" name="catalogue_description" id="catalogue_description" value="<?php echo esc_attr( $desc ); ?>" class="regular-text" placeholder="e.g. German Supplier">
					<p class="description"><?php _e( 'Small text displayed above the brand name.', 'project-core' ); ?></p>
				</td>
			</tr>
			<tr>
				<th><?php _e( 'PDF Catalogues', 'project-core' ); ?></th>
				<td>
					<div id="pdf_list_container">
						<?php 
						foreach ( $pdfs as $id ) {
							$file_name = get_the_title( $id );
							if ( ! $file_name ) continue;
							echo '<div class="pdf-item" data-id="' . esc_attr( $id ) . '">';
							echo '<span class="dashicons dashicons-pdf"></span>';
							echo '<span>' . esc_html( $file_name ) . '</span>';
							echo '<a class="remove-pdf">' . __( 'Remove', 'project-core' ) . '</a>';
							echo '</div>';
						}
						?>
					</div>
					<input type="hidden" name="catalogue_pdf_ids" id="catalogue_pdf_ids" value="<?php echo esc_attr( $pdf_ids ); ?>">
					<button type="button" class="button button-secondary" id="upload_pdfs_btn"><?php _e( 'Add PDF Files', 'project-core' ); ?></button>
				</td>
			</tr>
		</table>

		<script>
		jQuery(document).ready(function($) {
			var frame;
			$('#upload_pdfs_btn').on('click', function(e) {
				e.preventDefault();
				if (frame) { frame.open(); return; }
				frame = wp.media({
					title: 'Select PDF Catalogues',
					button: { text: 'Add to Catalogue' },
					library: { type: 'application/pdf' },
					multiple: true
				});
				frame.on('select', function() {
					var selections = frame.state().get('selection');
					var ids = $('#catalogue_pdf_ids').val() ? $('#catalogue_pdf_ids').val().split(',') : [];
					selections.map(function(attachment) {
						attachment = attachment.toJSON();
						if (ids.indexOf(attachment.id.toString()) === -1) {
							ids.push(attachment.id);
							$('#pdf_list_container').append(
								'<div class="pdf-item" data-id="' + attachment.id + '">' +
								'<span class="dashicons dashicons-pdf"></span>' +
								'<span>' + attachment.title + '</span>' +
								'<a class="remove-pdf">Remove</a>' +
								'</div>'
							);
						}
					});
					$('#catalogue_pdf_ids').val(ids.join(','));
				});
				frame.open();
			});
			$(document).on('click', '.remove-pdf', function() {
				var id = $(this).parent().data('id');
				var ids = $('#catalogue_pdf_ids').val().split(',');
				ids = ids.filter(function(item) { return item != id; });
				$('#catalogue_pdf_ids').val(ids.join(','));
				$(this).parent().remove();
			});
		});
		</script>
		<?php
	}

	/**
	 * Save metadata.
	 */
	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['catalogue_meta_nonce'] ) || ! wp_verify_nonce( $_POST['catalogue_meta_nonce'], 'save_catalogue_meta' ) ) {
			return;
		}
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		if ( isset( $_POST['catalogue_brand_name'] ) ) {
			$brand = sanitize_text_field( $_POST['catalogue_brand_name'] );
			update_post_meta( $post_id, self::META_BRAND_NAME, $brand );
			
			// Optional: Sync Post Title to Brand Name
			if ( ! empty( $brand ) ) {
				remove_action( 'save_post', [ $this, 'save_metadata' ] );
				wp_update_post( [ 'ID' => $post_id, 'post_title' => $brand ] );
				add_action( 'save_post', [ $this, 'save_metadata' ] );
			}
		}

		if ( isset( $_POST['catalogue_description'] ) ) {
			update_post_meta( $post_id, self::META_DESC, sanitize_text_field( $_POST['catalogue_description'] ) );
		}

		if ( isset( $_POST['catalogue_pdf_ids'] ) ) {
			update_post_meta( $post_id, self::META_PDF_IDS, sanitize_text_field( $_POST['catalogue_pdf_ids'] ) );
		}
	}

	/**
	 * Expose metadata to REST API.
	 */
	public function register_rest_fields() {
		register_rest_field(
			'catalogue',
			'catalogue_details',
			[
				'get_callback' => function( $object ) {
					$post_id = $object['id'];
					$pdf_ids = get_post_meta( $post_id, self::META_PDF_IDS, true );
					
					$pdf_list = [];
					if ( $pdf_ids ) {
						$ids = explode( ',', $pdf_ids );
						foreach ( $ids as $id ) {
							$url = wp_get_attachment_url( $id );
							if ( $url ) {
								$pdf_list[] = [
									'id'    => (int) $id,
									'title' => get_the_title( $id ),
									'url'   => $url,
									'size'  => size_format( filesize( get_attached_file( $id ) ) ),
									'date'  => get_the_date( 'd.m.Y', $id ),
								];
							}
						}
					}

					return [
						'brand_name'  => get_post_meta( $post_id, self::META_BRAND_NAME, true ),
						'description' => get_post_meta( $post_id, self::META_DESC, true ),
						'pdfs'        => $pdf_list,
					];
				}
			]
		);
	}
}
