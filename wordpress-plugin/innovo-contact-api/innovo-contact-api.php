<?php
/**
 * Plugin Name: Innovo Contact Form API
 * Description: Custom REST API endpoint for the React frontend contact form.
 * Version: 1.0
 * Author: Innovo Team
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * Register the REST API route
 */
add_action('rest_api_init', function () {
    register_rest_route('innovo/v1', '/contact', array(
        'methods' => 'POST',
        'callback' => 'handle_innovo_contact_form',
        'permission_callback' => '__return_true', // Public access for the contact form
    ));
});

/**
 * Handle the contact form submission
 */
function handle_innovo_contact_form($request) {
    // Get parameters from the request
    $params = $request->get_json_params();

    if (empty($params)) {
        return new WP_Error('no_data', 'No data provided', array('status' => 400));
    }

    // Sanitize the input
    $first_name = sanitize_text_field($params['firstName'] ?? '');
    $last_name  = sanitize_text_field($params['lastName'] ?? '');
    $email      = sanitize_email($params['email'] ?? '');
    $phone      = sanitize_text_field($params['phone'] ?? '');
    $message    = sanitize_textarea_field($params['message'] ?? '');

    // Prepare the email
    $to = get_option('admin_email'); // Default to admin email, or hardcode your email
    // Recipient for testing
    $to = "fares.xdev@gmail.com";

    $subject = "New Contact Form Submission from: " . $first_name . " " . $last_name;
    
    $body = "You have received a new message through the website contact form:\n\n";
    $body .= "Name: " . $first_name . " " . $last_name . "\n";
    $body .= "Email: " . $email . "\n";
    $body .= "Phone: " . $phone . "\n\n";
    $body .= "Message:\n" . $message . "\n";

    $headers = array('Content-Type: text/plain; charset=UTF-8');
    if ($email) {
        $headers[] = 'Reply-To: ' . $email;
    }

    // Send the email
    $sent = wp_mail($to, $subject, $body, $headers);

    if ($sent) {
        return new WP_REST_Response(array(
            'status' => 'success',
            'message' => 'Your message has been sent. Thank you!'
        ), 200);
    } else {
        return new WP_Error('send_failed', 'Failed to send email. Please check your mail server configuration.', array('status' => 500));
    }
}
