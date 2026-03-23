<?php

namespace ProjectCore\Admin;

/**
 * Class HeroMeta
 *
 * Simplified Meta Box for 'Hero Slider' with only a description field.
 */
class HeroMeta {

	const META_DESCRIPTION = '_hero_description';

	public function add_meta_boxes() {
		add_meta_box(
			'hero_details',
			__( 'Slide Content', 'project-core' ),
			[ $this, 'render_hero_meta_box' ],
			'hero-slides',
			'normal',
			'high'
		);
	}

	public function render_hero_meta_box( $post ) {
		wp_nonce_field( 'save_hero_meta', 'hero_meta_nonce' );
		$description = get_post_meta( $post->ID, self::META_DESCRIPTION, true );
		?>
		<table class="form-table">
			<tr>
				<th><label for="hero_description"><?php _e( 'Short Description', 'project-core' ); ?></label></th>
				<td><textarea name="hero_description" id="hero_description" rows="3" style="width: 100%;"><?php echo esc_textarea($description); ?></textarea></td>
			</tr>
		</table>
		<?php
	}

	public function save_metadata( $post_id ) {
		if ( ! isset( $_POST['hero_meta_nonce'] ) || ! wp_verify_nonce( $_POST['hero_meta_nonce'], 'save_hero_meta' ) ) return;
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
		if ( ! current_user_can( 'edit_post', $post_id ) ) return;

		if ( isset( $_POST['hero_description'] ) ) update_post_meta( $post_id, self::META_DESCRIPTION, sanitize_textarea_field( $_POST['hero_description'] ) );
	}

	public function register_rest_fields() {
		register_rest_field(
			'hero-slides',
			'hero_details',
			[
				'get_callback' => function( $object ) {
					$post_id = $object['id'];
					return [
						'description' => get_post_meta( $post_id, self::META_DESCRIPTION, true ),
					];
				}
			]
		);
	}
}
