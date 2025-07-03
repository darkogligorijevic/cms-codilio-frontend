pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "codilio/codilio-frontend"
        PRODUCTION_SERVER = "localhost"
        DEPLOY_PATH = "/home/codilio/codilio-app"
        KEEP_VERSIONS = "3"
        
        //  ENVIRONMENT DETECTION AND API URLS
        FRONTEND_URL = "https://codilio2.sbugarin.com"
        API_URL = "https://api-codilio2.sbugarin.com/api"
        FRONTEND_URL_ALT = "https://codilio.sbugarin.com"
        API_URL_ALT = "https://api-codilio.sbugarin.com/api"
        
        //  BUILD-TIME ENVIRONMENT VARIABLES - glavna API URL
        NEXT_PUBLIC_API_URL = "https://api-codilio.sbugarin.com/api"
        NODE_ENV = "production"
        NEXT_TELEMETRY_DISABLED = "1"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', 
                    url: 'https://github.com/darkogligorijevic/cms-codilio-frontend.git'
            }
        }

        stage('Enhanced API URLs Fixing') {
            steps {
                script {
                    echo "🔧 Enhanced API URLs fixing in source code..."
                    echo "Target API URL: ${NEXT_PUBLIC_API_URL}"
                    
                    sh """
                        echo "📝 Comprehensive API URL replacement..."
                        
                        # 1. PRIMARY: Fix lib/api.ts (main API configuration)
                        if [ -f "lib/api.ts" ]; then
                            echo "✅ Updating lib/api.ts with production API URL..."
                            
                            # Replace all localhost:3001 references with production API
                            sed -i 's|http://localhost:3001/api|${NEXT_PUBLIC_API_URL}|g' lib/api.ts
                            sed -i "s|'http://localhost:3001/api'|'${NEXT_PUBLIC_API_URL}'|g" lib/api.ts
                            sed -i 's|"http://localhost:3001/api"|"${NEXT_PUBLIC_API_URL}"|g' lib/api.ts
                            
                            # Replace any remaining localhost:3001 references
                            sed -i 's|localhost:3001|api-codilio.sbugarin.com|g' lib/api.ts
                            
                            echo "✅ lib/api.ts updated successfully"
                        else
                            echo "⚠️ lib/api.ts not found"
                        fi
                        
                        # 2. Fix use-activity-tracker.ts (WebSocket connections)
                        if [ -f "lib/use-activity-tracker.ts" ]; then
                            echo "✅ Updating WebSocket URLs in use-activity-tracker.ts..."
                            
                            # Replace localhost WebSocket URLs
                            sed -i 's|http://localhost:3001|https://api-codilio.sbugarin.com|g' lib/use-activity-tracker.ts
                            sed -i 's|ws://localhost:3001|wss://api-codilio.sbugarin.com|g' lib/use-activity-tracker.ts
                            
                            echo "✅ WebSocket URLs updated"
                        else
                            echo "⚠️ use-activity-tracker.ts not found"
                        fi
                        
                        # 3. Fix all React components that might have hardcoded URLs
                        echo "🔍 Fixing React components..."
                        find . -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | \
                        grep -E "(app/|components/|lib/)" | \
                        while read file; do
                            if grep -q "localhost:3001" "\$file" 2>/dev/null; then
                                echo "  📝 Fixing \$file"
                                sed -i 's|http://localhost:3001/api|${NEXT_PUBLIC_API_URL}|g' "\$file"
                                sed -i 's|http://localhost:3001|https://api-codilio.sbugarin.com|g' "\$file"
                                sed -i 's|ws://localhost:3001|wss://api-codilio.sbugarin.com|g' "\$file"
                                sed -i "s|'http://localhost:3001/api'|'${NEXT_PUBLIC_API_URL}'|g" "\$file"
                                sed -i 's|"http://localhost:3001/api"|"${NEXT_PUBLIC_API_URL}"|g' "\$file"
                            fi
                        done
                        
                        # 4. Check specific known problematic files
                        echo "🎯 Checking specific files for Relof Index and Settings..."
                        
                        # Relof Index related files
                        for file in app/dashboard/relof-index/*.tsx app/dashboard/relof-index/**/*.tsx; do
                            if [ -f "\$file" ] && grep -q "localhost:3001" "\$file" 2>/dev/null; then
                                echo "  📊 Fixing Relof Index file: \$file"
                                sed -i 's|http://localhost:3001/api|${NEXT_PUBLIC_API_URL}|g' "\$file"
                                sed -i 's|localhost:3001|api-codilio.sbugarin.com|g' "\$file"
                            fi
                        done
                        
                        # Settings related files
                        for file in app/dashboard/settings/*.tsx lib/settings-*.tsx lib/settings-*.ts; do
                            if [ -f "\$file" ] && grep -q "localhost:3001" "\$file" 2>/dev/null; then
                                echo "  ⚙️ Fixing Settings file: \$file"
                                sed -i 's|http://localhost:3001/api|${NEXT_PUBLIC_API_URL}|g' "\$file"
                                sed -i 's|localhost:3001|api-codilio.sbugarin.com|g' "\$file"
                            fi
                        done
                        
                        # 5. Fix any remaining localhost references in source code
                        echo "🧹 Final cleanup of remaining localhost references..."
                        find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                        grep -v node_modules | \
                        xargs grep -l "localhost:3001" 2>/dev/null | \
                        while read file; do
                            echo "  🔧 Final fix: \$file"
                            sed -i 's|http://localhost:3001/api|${NEXT_PUBLIC_API_URL}|g' "\$file"
                            sed -i 's|http://localhost:3001|https://api-codilio.sbugarin.com|g' "\$file"
                            sed -i 's|ws://localhost:3001|wss://api-codilio.sbugarin.com|g' "\$file"
                            sed -i 's|localhost:3001|api-codilio.sbugarin.com|g' "\$file"
                        done
                        
                        # 6. Verification - check if any localhost:3001 references remain
                        echo "🔍 Verification - checking for remaining localhost:3001 references..."
                        REMAINING_LOCALHOST=\$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                            grep -v node_modules | \
                            xargs grep -l "localhost:3001" 2>/dev/null | wc -l)
                        
                        if [ "\$REMAINING_LOCALHOST" -eq 0 ]; then
                            echo "✅ SUCCESS: No localhost:3001 references found in source code"
                        else
                            echo "⚠️ WARNING: Found \$REMAINING_LOCALHOST files still containing localhost:3001"
                            find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                                grep -v node_modules | \
                                xargs grep -l "localhost:3001" 2>/dev/null | head -5
                        fi
                        
                        # 7. Show sample of what we've configured
                        echo "📋 Configuration summary:"
                        echo "  Production API URL: ${NEXT_PUBLIC_API_URL}"
                        echo "  Frontend URL: ${FRONTEND_URL}"
                        echo "  Node Environment: ${NODE_ENV}"
                        
                        # 8. Special check for lib/api.ts content
                        if [ -f "lib/api.ts" ]; then
                            echo "🔍 Verifying lib/api.ts configuration..."
                            if grep -q "${NEXT_PUBLIC_API_URL}" lib/api.ts; then
                                echo "✅ lib/api.ts contains correct production URL"
                            else
                                echo "❌ lib/api.ts may not be properly configured"
                                echo "First 20 lines of getApiBaseUrl function:"
                                grep -A 20 "getApiBaseUrl" lib/api.ts || echo "Function not found"
                            fi
                        fi
                    """
                }
            }
        }

        stage('Build Docker Image with Environment') {
            steps {
                script {
                    echo "🔧 Building Docker image with environment variables..."
                    echo "API URL: ${NEXT_PUBLIC_API_URL}"
                    
                    // Build with build args
                    def image = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}", 
                        "--build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} " +
                        "--build-arg NODE_ENV=${NODE_ENV} " +
                        "--build-arg NEXT_TELEMETRY_DISABLED=${NEXT_TELEMETRY_DISABLED} " +
                        "."
                    )
                    env.DOCKER_IMAGE = "${IMAGE_NAME}:${BUILD_NUMBER}"
                    
                    echo "✅ Docker image built successfully with API URL: ${NEXT_PUBLIC_API_URL}"
                }
            }
        }

        stage('Verify Build Contents') {
            steps {
                script {
                    echo "🔍 Verifying Docker image contents..."
                    
                    sh """
                        echo "🧪 Testing built image for API URL configuration..."
                        
                        # Create temporary container to inspect contents
                        TEMP_CONTAINER=\$(docker create ${IMAGE_NAME}:${BUILD_NUMBER})
                        
                        # Check compiled JavaScript for localhost references
                        echo "🔍 Checking for localhost:3001 in compiled JavaScript..."
                        docker run --rm ${IMAGE_NAME}:${BUILD_NUMBER} find /app -name "*.js" -exec grep -l "localhost:3001" {} \\; 2>/dev/null | head -5 || echo "✅ No localhost:3001 found in compiled JS"
                        
                        # Check for correct API URL in compiled code
                        echo "🔍 Checking for production API URL in compiled code..."
                        docker run --rm ${IMAGE_NAME}:${BUILD_NUMBER} find /app -name "*.js" -exec grep -l "api-codilio.sbugarin.com" {} \\; 2>/dev/null | head -3 || echo "⚠️ Production API URL not found in compiled JS"
                        
                        # Cleanup
                        docker rm \$TEMP_CONTAINER || true
                        
                        echo "✅ Build verification completed"
                    """
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    script {
                        sh 'docker login -u $USERNAME -p $PASSWORD'
                        sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${IMAGE_NAME}:latest"
                        sh "docker push ${IMAGE_NAME}:${BUILD_NUMBER}"
                        sh "docker push ${IMAGE_NAME}:latest"
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            steps {
                script {
                    echo "🚀 Starting production frontend deployment..."
                    
                    sh """
                        echo "📍 Checking deployment directory..."
                        if [ -d "${DEPLOY_PATH}" ]; then
                            echo "✅ Found deployment directory: ${DEPLOY_PATH}"
                            cd ${DEPLOY_PATH}
                        else
                            echo "❌ Deployment directory ${DEPLOY_PATH} not found!"
                            exit 1
                        fi
                        
                        echo "📥 Pulling latest frontend image..."
                        docker pull ${IMAGE_NAME}:latest
                        
                        echo "🌐 Ensuring Docker network exists..."
                        docker network inspect codilio-network >/dev/null 2>&1 || docker network create codilio-network
                        
                        echo "🛑 ENHANCED: Complete frontend cleanup..."
                        
                        # 1. Stop docker-compose services gracefully
                        docker-compose stop frontend 2>/dev/null || echo "Frontend service was not running"
                        
                        # 2. KRITIČNO: Force remove containers by name
                        echo "🗑️ Removing containers by name..."
                        docker rm -f codilio-frontend 2>/dev/null || echo "No codilio-frontend container found"
                        
                        # 3. Remove any containers using the frontend image
                        echo "🗑️ Removing containers using frontend image..."
                        FRONTEND_CONTAINERS=\$(docker ps -aq --filter "ancestor=${IMAGE_NAME}:latest" 2>/dev/null)
                        if [ ! -z "\$FRONTEND_CONTAINERS" ]; then
                            echo "Found containers using frontend image, removing..."
                            docker rm -f \$FRONTEND_CONTAINERS || true
                        fi
                        
                        # 4. Cleanup any orphaned containers
                        docker container prune -f 2>/dev/null || true
                        
                        # 5. Wait a moment for Docker to clean up
                        echo "⏳ Waiting for cleanup to complete..."
                        sleep 5
                        
                        echo "✅ Cleanup completed - no conflicts should remain"
                        
                        echo "🔄 Starting fresh frontend service..."
                        if [ -f "docker-compose.yml" ]; then
                            echo "✅ Using docker-compose for deployment"
                            
                            # Start with fresh containers
                            docker-compose up -d --force-recreate --renew-anon-volumes frontend
                            
                            echo "⏳ Waiting for frontend to initialize..."
                            sleep 30
                            
                            # Verify container is running
                            if docker ps | grep -q "codilio-frontend"; then
                                echo "✅ Frontend container is running"
                            else
                                echo "❌ Frontend container failed to start"
                                echo "📋 Container status:"
                                docker ps -a | grep codilio-frontend || echo "No frontend container found"
                                echo "📋 Recent logs:"
                                docker logs codilio-frontend --tail 20 2>/dev/null || echo "Cannot retrieve logs"
                                exit 1
                            fi
                        else
                            echo "❌ docker-compose.yml not found in ${DEPLOY_PATH}"
                            exit 1
                        fi
                        
                        echo "✅ Frontend deployment stage completed successfully"
                    """
                }
            }
        }

        stage('Enhanced Frontend Health Check') {
            steps {
                script {
                    echo "🔍 Running enhanced frontend health check..."
                    
                    sh """
                        echo "🧪 Testing frontend at http://localhost:3000 (local)"
                        
                        for i in {1..15}; do
                            if curl -f -s http://localhost:3000/ > /dev/null; then
                                echo "✅ Frontend container is responding locally!"
                                
                                # Test if the API URL is correctly configured
                                echo "🔍 Checking API configuration in frontend..."
                                docker logs codilio-frontend --tail 10 | grep -i "api\\|url\\|config" || true
                                
                                # Test API connectivity from frontend container
                                echo "🔗 Testing API connectivity from frontend container..."
                                docker exec codilio-frontend wget --timeout=10 -q -O /dev/null ${NEXT_PUBLIC_API_URL} && echo "✅ API reachable from frontend" || echo "⚠️ API not reachable from frontend"
                                
                                # 🆕 CRITICAL: Enhanced localhost detection in running container
                                echo "🕵️ Comprehensive localhost:3001 verification in running container..."
                                
                                # Check JavaScript files in .next directory
                                LOCALHOST_JS_COUNT=\$(docker exec codilio-frontend find /app/.next -name "*.js" -exec grep -l "localhost:3001" {} \\; 2>/dev/null | wc -l)
                                echo "  JavaScript files with localhost:3001: \$LOCALHOST_JS_COUNT"
                                
                                # Check all files for localhost references
                                TOTAL_LOCALHOST_COUNT=\$(docker exec codilio-frontend find /app -type f -exec grep -l "localhost:3001" {} \\; 2>/dev/null | wc -l)
                                echo "  Total files with localhost:3001: \$TOTAL_LOCALHOST_COUNT"
                                
                                if [ "\$TOTAL_LOCALHOST_COUNT" -eq 0 ]; then
                                    echo "✅ PERFECT: No localhost:3001 references found in running container"
                                else
                                    echo "⚠️ Found \$TOTAL_LOCALHOST_COUNT files with localhost:3001 references"
                                    echo "  First few problematic files:"
                                    docker exec codilio-frontend find /app -type f -exec grep -l "localhost:3001" {} \\; 2>/dev/null | head -3
                                    
                                    # Show sample content to debug
                                    echo "  Sample problematic content:"
                                    docker exec codilio-frontend find /app -name "*.js" -exec grep -n "localhost:3001" {} \\; 2>/dev/null | head -2
                                fi
                                
                                # Test if production API URL is present
                                PRODUCTION_API_COUNT=\$(docker exec codilio-frontend find /app -type f -exec grep -l "api-codilio.sbugarin.com" {} \\; 2>/dev/null | wc -l)
                                echo "  Files with production API URL: \$PRODUCTION_API_COUNT"
                                
                                if [ "\$PRODUCTION_API_COUNT" -gt 0 ]; then
                                    echo "✅ Production API URL found in container"
                                else
                                    echo "⚠️ Production API URL not found - this may cause issues"
                                fi
                                
                                # Test actual frontend response content
                                response_content=\$(curl -s http://localhost:3000/ 2>/dev/null | head -200)
                                if echo "\$response_content" | grep -q "html\\|DOCTYPE\\|codilio\\|next" > /dev/null; then
                                    echo "✅ Frontend is serving valid HTML content"
                                    
                                    if echo "\$response_content" | grep -q "codilio" > /dev/null; then
                                        echo "✅ Codilio branding detected in content"
                                    fi
                                else
                                    echo "⚠️ Frontend responding but content may be incomplete"
                                fi
                                break
                            else
                                echo "⏳ Health check attempt \$i/15 - waiting for frontend..."
                                sleep 12
                            fi
                            
                            if [ \$i -eq 15 ]; then
                                echo "❌ Frontend health check failed after 3 minutes"
                                echo ""
                                echo "🔍 Debugging information:"
                                echo "Frontend container status:"
                                docker ps | grep codilio-frontend || echo "❌ Frontend container not found"
                                echo ""
                                echo "📋 Last 30 lines of frontend logs:"
                                docker logs codilio-frontend --tail 30 || echo "❌ Cannot retrieve frontend logs"
                                echo ""
                                echo "🔧 Environment variables in container:"
                                docker exec codilio-frontend env | grep -E "NEXT_PUBLIC|NODE_ENV|API" || echo "❌ Cannot retrieve environment variables"
                                echo ""
                                echo "🕵️ Container localhost check:"
                                docker exec codilio-frontend find /app -name "*.js" -exec grep -l "localhost:3001" {} \\; 2>/dev/null | head -5 || echo "No localhost references found"
                                exit 1
                            fi
                        done
                        
                        echo "🌐 Testing production URLs:"
                        echo "  Primary: ${FRONTEND_URL}"
                        if curl -f -s ${FRONTEND_URL}/ > /dev/null; then
                            echo "✅ Primary production URL is accessible!"
                        else
                            echo "⚠️ Primary production URL not accessible yet"
                        fi
                        
                        echo "  Alternative: ${FRONTEND_URL_ALT}"
                        if curl -f -s ${FRONTEND_URL_ALT}/ > /dev/null; then
                            echo "✅ Alternative production URL is accessible!"
                        else
                            echo "⚠️ Alternative production URL not accessible yet"
                        fi
                        
                        echo "🎉 Enhanced frontend health check passed!"
                    """
                }
            }
        }

        stage('Full Stack Integration Test') {
            steps {
                script {
                    echo "🔗 Running full stack integration test..."
                    
                    sh """
                        echo "🧪 Testing full application stack..."
                        
                        # Backend API Test
                        if curl -f -s http://localhost:3001/api > /dev/null; then
                            echo "✅ Backend API is reachable locally"
                        else
                            echo "❌ Backend API is not reachable locally"
                            echo "🔧 Checking backend status..."
                            docker ps | grep codilio-backend || echo "Backend container not running"
                            exit 1
                        fi
                        
                        # Frontend Test
                        if curl -f -s http://localhost:3000/ > /dev/null; then
                            echo "✅ Frontend is reachable locally"
                        else
                            echo "❌ Frontend is not reachable locally"
                            exit 1
                        fi
                        
                        # Test API URLs configuration
                        echo "🌐 Testing API URLs from environment:"
                        echo "  Configured API URL: ${NEXT_PUBLIC_API_URL}"
                        if curl -f -s ${NEXT_PUBLIC_API_URL} > /dev/null; then
                            echo "✅ Configured API URL is accessible!"
                        else
                            echo "⚠️ Configured API URL not accessible"
                        fi
                        
                        echo "🌐 Testing production APIs:"
                        echo "  Primary API: ${API_URL}"
                        if curl -f -s ${API_URL} > /dev/null; then
                            echo "✅ Primary production API is reachable!"
                        else
                            echo "⚠️ Primary production API not accessible yet"
                        fi
                        
                        echo "  Alternative API: ${API_URL_ALT}"
                        if curl -f -s ${API_URL_ALT} > /dev/null; then
                            echo "✅ Alternative production API is reachable!"
                        else
                            echo "⚠️ Alternative production API not accessible yet"
                        fi
                        
                        echo "🔗 Testing frontend-backend communication..."
                        if docker exec codilio-frontend wget --timeout=5 -q -O /dev/null ${NEXT_PUBLIC_API_URL} 2>/dev/null; then
                            echo "✅ Frontend can communicate with configured API"
                        else
                            echo "⚠️ Frontend-API communication issue detected"
                            echo "This may not affect browser-based functionality"
                        fi
                        
                        echo "🎉 Full stack integration test completed!"
                        echo ""
                        echo "🌐 Application URLs:"
                        echo "   Frontend (local):     http://localhost:3000"
                        echo "   Frontend (primary):   ${FRONTEND_URL}"
                        echo "   Frontend (alt):       ${FRONTEND_URL_ALT}"
                        echo "   Backend (local):      http://localhost:3001/api"
                        echo "   Backend (primary):    ${API_URL}"
                        echo "   Backend (alt):        ${API_URL_ALT}"
                        echo "   Configured API:       ${NEXT_PUBLIC_API_URL}"
                    """
                }
            }
        }

        stage('Smart Cleanup') {
            steps {
                script {
                    echo "🧹 Starting smart cleanup process..."
                    
                    sh """
                        echo "🗑️ Cleaning up current build images locally..."
                        docker rmi ${IMAGE_NAME}:${BUILD_NUMBER} || true
                        
                        echo "🔍 Checking old ${IMAGE_NAME} versions..."
                        OLD_TAGS=\$(docker images ${IMAGE_NAME} --format "{{.Tag}}" | grep -E '^[0-9]+\$' | sort -nr | tail -n +4)
                        
                        if [ ! -z "\$OLD_TAGS" ]; then
                            echo "🗑️ Removing old ${IMAGE_NAME} versions:"
                            for tag in \$OLD_TAGS; do
                                echo "  Removing ${IMAGE_NAME}:\$tag"
                                docker rmi ${IMAGE_NAME}:\$tag || true
                            done
                        else
                            echo "✅ No old versions to remove"
                        fi
                        
                        echo "🧽 General Docker cleanup..."
                        docker image prune -f
                        docker container prune -f
                        docker builder prune -f --keep-storage 1GB
                    """
                    
                    sh "docker logout || true"
                    echo "✅ Smart cleanup completed successfully"
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "Workspace cleanup skipped: ${e.getMessage()}"
                }
            }
        }
        success {
            echo "🎉 Frontend build, push, and deployment completed successfully!"
            echo ""
            echo "🌐 Application is ready:"
            echo "   Frontend (local):     http://localhost:3000"
            echo "   Frontend (primary):   ${FRONTEND_URL}"
            echo "   Frontend (alt):       ${FRONTEND_URL_ALT}"
            echo "   Backend (local):      http://localhost:3001/api"
            echo "   Backend (primary):    ${API_URL}"
            echo "   Backend (alt):        ${API_URL_ALT}"
            echo "   API Configuration:    ${NEXT_PUBLIC_API_URL}"
            echo ""
            echo "📊 Deployed frontend image: ${IMAGE_NAME}:${BUILD_NUMBER}"
            echo "🐳 Container: codilio-frontend"
            echo ""
            echo "🔧 Management commands:"
            echo "   cd ${DEPLOY_PATH} && docker-compose restart frontend"
            echo "   cd ${DEPLOY_PATH} && docker-compose ps"
            echo ""
            echo "⚡ Cloudflare Tunnel routes (3000/3001):"
            echo "   codilio2.sbugarin.com -> http://localhost:3000"
            echo "   api-codilio2.sbugarin.com -> http://localhost:3001"
            echo "   codilio.sbugarin.com -> http://localhost:3000"
            echo "   api-codilio.sbugarin.com -> http://localhost:3001"
            
            script {
                sh """
                    echo ""
                    echo "🧹 Post-success cleanup..."
                    docker image prune -a -f --filter "until=24h"
                    echo "📊 Current Docker disk usage:"
                    docker system df
                """
            }
        }
        failure {
            echo "❌ Frontend build or deployment failed! Check the logs above for details."
            
            script {
                echo "💾 Keeping images for debugging purposes (no cleanup on failure)"
                
                sh """
                    echo ""
                    echo "🔍 Additional debugging information:"
                    echo "==================================="
                    echo "Docker networks:"
                    docker network ls
                    echo ""
                    echo "All running containers:"
                    docker ps -a | head -10
                    echo ""
                    echo "Environment variables used:"
                    echo "  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}"
                    echo "  NODE_ENV: ${NODE_ENV}"
                    echo "  NEXT_TELEMETRY_DISABLED: ${NEXT_TELEMETRY_DISABLED}"
                    echo ""
                    echo "Available disk space:"
                    df -h | head -5
                    echo ""
                    echo "Recent images:"
                    docker images | head -10
                    echo ""
                    echo "Deployment directory check:"
                    ls -la ${DEPLOY_PATH}/ || echo "Deployment directory does not exist or no access"
                    echo ""
                    echo "🕵️ Final localhost check in failed deployment:"
                    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                        grep -v node_modules | \
                        xargs grep -l "localhost:3001" 2>/dev/null | head -5 || echo "No localhost references found in source"
                """
            }
        }
    }
}
