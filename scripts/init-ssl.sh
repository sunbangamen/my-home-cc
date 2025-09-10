#!/bin/bash
# SSL Certificate Initialization Script for Let's Encrypt

set -e

# Load environment variables
if [ -f .env.prod ]; then
    export $(grep -v '^#' .env.prod | xargs)
fi

# Configuration
DOMAIN_NAME=${DOMAIN_NAME:-localhost}
EMAIL=${EMAIL:-admin@example.com}
RSA_KEY_SIZE=4096
STAGING=${STAGING:-0}  # Set to 1 for staging environment

echo "🔐 Initializing SSL certificates for $DOMAIN_NAME"

# Check if domain is properly configured
if [ "$DOMAIN_NAME" = "localhost" ] || [ "$DOMAIN_NAME" = "yourdomain.com" ]; then
    echo "❌ Error: Please configure DOMAIN_NAME in .env.prod"
    echo "   Current value: $DOMAIN_NAME"
    exit 1
fi

# Check if email is properly configured
if [ "$EMAIL" = "admin@yourdomain.com" ] || [ "$EMAIL" = "admin@example.com" ]; then
    echo "❌ Error: Please configure EMAIL in .env.prod"
    echo "   Current value: $EMAIL"
    exit 1
fi

# Create directories
echo "📁 Creating certificate directories..."
mkdir -p nginx/certbot-www
docker volume create letsencrypt_prod 2>/dev/null || true

# Check if certificates already exist
if docker run --rm -v letsencrypt_prod:/etc/letsencrypt certbot/certbot \
    certificates | grep -q "$DOMAIN_NAME"; then
    echo "✅ Certificates for $DOMAIN_NAME already exist"
    echo "   Use 'docker-compose -f docker-compose.prod.yml up certbot' to renew"
    exit 0
fi

echo "🚀 Starting Nginx for ACME challenge..."

# Start nginx with HTTP-only configuration for ACME challenge
cat > nginx/nginx-init.conf << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files \$uri \$uri/ =404;
    }
    
    location / {
        return 200 'SSL initialization in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# Start temporary nginx container
docker run -d --name nginx-ssl-init \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-init.conf:/etc/nginx/conf.d/default.conf" \
    -v "$(pwd)/nginx/certbot-www:/var/www/certbot" \
    nginx:1.25-alpine

echo "⏳ Waiting for Nginx to start..."
sleep 5

# Test if domain is accessible
echo "🌐 Testing domain accessibility..."
if ! curl -f "http://$DOMAIN_NAME" >/dev/null 2>&1; then
    echo "❌ Error: Domain $DOMAIN_NAME is not accessible"
    echo "   Please ensure:"
    echo "   1. Domain DNS points to this server"
    echo "   2. Port 80 is open and accessible"
    echo "   3. No other web server is running on port 80"
    docker rm -f nginx-ssl-init
    exit 1
fi

echo "✅ Domain is accessible"

# Determine certbot server
if [ "$STAGING" = "1" ]; then
    CERTBOT_SERVER="--server https://acme-staging-v02.api.letsencrypt.org/directory"
    echo "🧪 Using Let's Encrypt staging environment"
else
    CERTBOT_SERVER=""
    echo "🔒 Using Let's Encrypt production environment"
fi

# Request certificate
echo "📜 Requesting SSL certificate for $DOMAIN_NAME..."

docker run --rm \
    -v letsencrypt_prod:/etc/letsencrypt \
    -v "$(pwd)/nginx/certbot-www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    $CERTBOT_SERVER \
    -d "$DOMAIN_NAME"

# Check if certificate was created successfully
if docker run --rm -v letsencrypt_prod:/etc/letsencrypt certbot/certbot \
    certificates | grep -q "$DOMAIN_NAME"; then
    echo "✅ SSL certificate successfully created for $DOMAIN_NAME"
else
    echo "❌ Failed to create SSL certificate"
    docker rm -f nginx-ssl-init
    exit 1
fi

# Clean up temporary nginx
echo "🧹 Cleaning up temporary containers..."
docker rm -f nginx-ssl-init

# Remove temporary nginx config
rm -f nginx/nginx-init.conf

echo ""
echo "🎉 SSL initialization completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start production environment: docker-compose -f docker-compose.prod.yml up -d"
echo "2. Check logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "3. Test HTTPS: https://$DOMAIN_NAME"
echo ""
echo "Certificate will auto-renew every 12 hours via the certbot container."