<?php

namespace ProjectCore\Admin;

/**
 * Class HomeVideoMeta
 *
 * Handles custom meta boxes for the Home Video CPT.
 *
 * @package ProjectCore\Admin
 */
class HomeVideoMeta {

	/**
	 * Register the meta boxes.
	 */
	public function register_meta_boxes() {
		add_meta_box(
			'home_video_details',
			__( 'Home Video Details', 'project-core' ),
			[ $this, 'render_meta_box' ],
			'home-video',
			'normal',
			'high'
		);
	}

	/**
	 * Render the meta box content.
	 *
	 * @param \WP_Post $post The current post.
	 */
	public function render_meta_box( $post ) {
		wp_nonce_field( 'home_video_meta_nonce', 'home_video_meta_nonce_field' );

		$subtitle    = get_post_meta( $post->ID, '_home_video_subtitle', true );
		$description = get_post_meta( $post->ID, '_home_video_description', true );
		$video_url   = get_post_meta( $post->ID, '_home_video_url', true );
		$btn_text    = get_post_meta( $post->ID, '_home_video_btn_text', true );
		$btn_link    = get_post_meta( $post->ID, '_home_video_btn_link', true );

		?>
		<p>
			<label for="home_video_subtitle"><?php _e( 'Subtitle', 'project-core' ); ?></label><br>
			<input type="text" id="home_video_subtitle" name="home_video_subtitle" value="<?php echo esc_attr( $subtitle ); ?>" class="widefat" placeholder="MAKING MASTERPIECES">
		</p>
		<p>
			<label for="home_video_description"><?php _e( 'Description', 'project-core' ); ?></label><br>
			<textarea id="home_video_description" name="home_video_description" rows="4" class="widefat"><?php echo esc_textarea( $description ); ?></textarea>
		</p>
		<p>
			<label for="home_video_url"><?php _e( 'YouTube Video URL', 'project-core' ); ?></label><br>
			<input type="url" id="home_video_url" name="home_video_url" value="<?php echo esc_url( $video_url ); ?>" class="widefat" placeholder="https://www.youtube.com/embed/...">
			<small><?php _e( 'Note: Use the YouTube embed link (e.g., https://www.youtube.com/embed/dQw4w9WgXcQ)', 'project-core' ); ?></small>
		</p>
		<p>
			<label for="home_video_btn_text"><?php _e( 'Button Text', 'project-core' ); ?></label><br>
			<input type="text" id="home_video_btn_text" name="home_video_btn_text" value="<?php echo esc_attr( $btn_text ); ?>" class="widefat" placeholder="EXPLORE ALL PROJECTS">
		</p>
		<p>
			<label for="home_video_btn_link"><?php _e( 'Button Link', 'project-core' ); ?></label><br>
			<input type="text" id="home_video_btn_link" name="home_video_btn_link" value="<?php echo esc_attr( $btn_link ); ?>" class="widefat" placeholder="/projects">
		</p>
		<?php
	}

	/**
	 * Save the meta box data.
	 *
	 * @param int $post_id The ID of the post being saved.
	 */
	public function save_meta_box( $post_id ) {
		if ( ! isset( $_POST['home_video_meta_nonce_field'] ) || ! wp_verify_nonce( $_POST['home_video_meta_nonce_field'], 'home_video_meta_nonce' ) ) {
			return;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}

		$fields = [
			'home_video_subtitle'    => '_home_video_subtitle',
			'home_video_description' => '_home_video_description',
			'home_video_url'         => '_home_video_url',
			'home_video_btn_text'    => '_home_video_btn_text',
			'home_video_btn_link'    => '_home_video_btn_link',
		];

		foreach ( $fields as $input => $meta_key ) {
			if ( isset( $_POST[ $input ] ) ) {
				update_post_meta( $post_id, $meta_key, sanitize_text_field( $_POST[ $input ] ) );
			}
		}
	}

	/**
	 * Register REST fields for the Home Video CPT.
	 */
	public function register_rest_fields() {
		register_rest_field(
			'home-video',
			'video_details',
			[
				'get_callback' => function( $post ) {
					return [
						'subtitle'    => get_post_meta( $post['id'], '_home_video_subtitle', true ),
						'description' => get_post_meta( $post['id'], '_home_video_description', true ),
						'video_url'   => get_post_meta( $post['id'], '_home_video_url', true ),
						'btn_text'    => get_post_meta( $post['id'], '_home_video_btn_text', true ),
						'btn_link'    => get_post_meta( $post['id'], '_home_video_btn_link', true ),
					];
				},
			]
		);
	}
}
