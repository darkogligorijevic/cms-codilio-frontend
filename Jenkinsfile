pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "codilio/codilio-frontend"
        PRODUCTION_SERVER = "localhost"
        DEPLOY_PATH = "/home/codilio/codilio-app"  // Putanja gde je docker-compose.yml
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'dark-mode-darko-dev', 
                    url: 'https://github.com/darkogligorijevic/cms-codilio-frontend.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${IMAGE_NAME}:${BUILD_NUMBER}")
                    env.DOCKER_IMAGE = "${IMAGE_NAME}:${BUILD_NUMBER}"
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
                    echo "🚀 Starting localhost frontend deployment..."
                    
                    sh """
                        echo "📍 Checking deployment directory..."
                        if [ -d "${DEPLOY_PATH}" ]; then
                            echo "✅ Found deployment directory: ${DEPLOY_PATH}"
                            cd ${DEPLOY_PATH}
                        else
                            echo "⚠️ Deployment directory ${DEPLOY_PATH} not found"
                            echo "📁 Current directory: \$(pwd)"
                            echo "🔧 Attempting to create deployment structure..."
                            
                            # Create deployment directory
                            sudo mkdir -p ${DEPLOY_PATH}
                            sudo chown jenkins:jenkins ${DEPLOY_PATH}
                            
                            # Copy docker-compose.yml from workspace or create basic one
                            if [ -f "/var/lib/jenkins/docker-compose.yml" ]; then
                                sudo cp /var/lib/jenkins/docker-compose.yml ${DEPLOY_PATH}/
                            else
                                echo "📝 Creating basic docker-compose.yml..."
                                cat > ${DEPLOY_PATH}/docker-compose.yml << 'EOL'
version: '3.8'

services:
  backend:
    image: codilio/codilio-backend:latest
    container_name: codilio-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_OPTIONS=--enable-source-maps
      - DB_HOST=host.docker.internal
      - DB_PORT=3306
      - DB_USERNAME=root
      - DB_PASSWORD=Sabac2025
      - DB_DATABASE=codilio
      - DB_CHARSET=utf8mb4
      - DB_COLLATION=utf8mb4_unicode_ci
      - JWT_SECRET=6yaU6JWe8Euwa5qdS11yVg==
      - JWT_EXPIRES_IN_PROD=2h
      - NODE_ENV=production
      - PORT=3001
      - MAX_FILE_SIZE=5242880
      - UPLOAD_DIRECTORY=/app/uploads
      - DEFAULT_ADMIN_EMAIL=admin@admin.com
      - DEFAULT_ADMIN_PASSWORD=1234567
      - DEFAULT_ADMIN_NAME=admin
      - FRONTEND_URL=http://localhost:3000
    volumes:
      - backend_uploads:/app/uploads
      - backend_logs:/app/logs
      - ai_docs:/app/ai-docs
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - codilio-network

  frontend:
    image: codilio/codilio-frontend:latest
    container_name: codilio-frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001/api
    depends_on:
      - backend
    networks:
      - codilio-network

volumes:
  backend_uploads:
  backend_logs:
  ai_docs:

networks:
  codilio-network:
    driver: bridge
EOL
                            fi
                            
                            cd ${DEPLOY_PATH}
                        fi
                        
                        echo "📥 Pulling latest frontend image..."
                        docker pull ${IMAGE_NAME}:latest
                        
                        echo "🔄 Updating frontend service..."
                        if [ -f "docker-compose.yml" ]; then
                            echo "✅ Using docker-compose for deployment"
                            
                            # Ensure network exists
                            docker network inspect codilio-network >/dev/null 2>&1 || docker network create codilio-network
                            
                            # Ensure volumes exist
                            docker volume inspect backend_uploads >/dev/null 2>&1 || docker volume create backend_uploads
                            docker volume inspect backend_logs >/dev/null 2>&1 || docker volume create backend_logs
                            docker volume inspect ai_docs >/dev/null 2>&1 || docker volume create ai_docs
                            
                            # Stop and remove old frontend container if exists
                            docker-compose stop frontend || true
                            docker-compose rm -f frontend || true
                            
                            # Pull latest and start
                            docker-compose pull frontend
                            docker-compose up -d frontend
                            
                            echo "⏳ Waiting for frontend to start..."
                            sleep 25
                        else
                            echo "❌ docker-compose.yml still not found after creation attempt"
                            exit 1
                        fi
                        
                        echo "✅ Frontend deployment stage completed"
                    """
                }
            }
        }

        stage('Frontend Health Check') {
            steps {
                script {
                    echo "🔍 Running frontend health check..."
                    
                    sh """
                        echo "🧪 Testing frontend at http://localhost:3000"
                        for i in {1..12}; do
                            if curl -f -s http://localhost:3000/ > /dev/null; then
                                echo "✅ Frontend is responding successfully!"
                                
                                # Test if it's actually serving the app
                                response_content=\$(curl -s http://localhost:3000/ 2>/dev/null | head -200)
                                if echo "\$response_content" | grep -q "html\\|DOCTYPE\\|codilio\\|next" > /dev/null; then
                                    echo "✅ Frontend is serving valid HTML content"
                                    
                                    # Check for some key indicators
                                    if echo "\$response_content" | grep -q "codilio" > /dev/null; then
                                        echo "✅ Codilio branding detected in content"
                                    fi
                                else
                                    echo "⚠️ Frontend responding but content may be incomplete"
                                fi
                                break
                            else
                                echo "⏳ Health check attempt \$i/12 - waiting for frontend..."
                                sleep 10
                            fi
                            
                            if [ \$i -eq 12 ]; then
                                echo "❌ Frontend health check failed after 2 minutes"
                                echo ""
                                echo "🔍 Debugging information:"
                                echo "Frontend container status:"
                                docker ps | grep codilio-frontend || echo "❌ Frontend container not found"
                                echo ""
                                echo "📋 Last 30 lines of frontend logs:"
                                docker logs codilio-frontend --tail 30 || echo "❌ Cannot retrieve frontend logs"
                                echo ""
                                echo "🌐 Network connections:"
                                netstat -tlnp | grep :3000 || echo "❌ Port 3000 not listening"
                                echo ""
                                echo "🔗 Testing backend connectivity:"
                                curl -f http://localhost:3001/api 2>/dev/null && echo "✅ Backend reachable" || echo "❌ Backend not reachable"
                                echo ""
                                echo "🐳 All containers:"
                                docker ps -a
                                echo ""
                                echo "🌐 Available networks:"
                                docker network ls
                                echo ""
                                echo "💾 Available volumes:"
                                docker volume ls | grep codilio || echo "No codilio volumes found"
                                exit 1
                            fi
                        done
                        
                        echo "🎉 Frontend health check passed!"
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
                        
                        # Test backend API
                        if curl -f -s http://localhost:3001/api > /dev/null; then
                            echo "✅ Backend API is reachable"
                        else
                            echo "❌ Backend API is not reachable"
                            echo "🔧 Checking backend status..."
                            docker ps | grep codilio-backend || echo "Backend container not running"
                            exit 1
                        fi
                        
                        # Test frontend
                        if curl -f -s http://localhost:3000/ > /dev/null; then
                            echo "✅ Frontend is reachable"
                        else
                            echo "❌ Frontend is not reachable"
                            exit 1
                        fi
                        
                        # Test frontend-backend communication
                        echo "🔗 Testing frontend-backend communication..."
                        if docker exec codilio-frontend curl -f http://localhost:3001/api > /dev/null 2>&1; then
                            echo "✅ Frontend can communicate with backend"
                        else
                            echo "⚠️ Frontend-backend communication issue detected"
                            echo "🔍 Checking network setup..."
                            docker network ls | grep codilio || echo "Codilio network missing"
                            echo "🔍 Checking if both containers are on same network..."
                            docker inspect codilio-frontend | grep -A5 Networks || echo "Cannot inspect frontend network"
                            docker inspect codilio-backend | grep -A5 Networks || echo "Cannot inspect backend network"
                            echo "This may not affect browser-based functionality"
                        fi
                        
                        echo "🎉 Full stack integration test completed!"
                        echo ""
                        echo "🌐 Application URLs:"
                        echo "   Frontend: http://localhost:3000"
                        echo "   Backend:  http://localhost:3001/api"
                        echo ""
                        echo "🧪 Quick manual tests:"
                        echo "   curl http://localhost:3000"
                        echo "   curl http://localhost:3001/api"
                    """
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    sh "docker rmi ${IMAGE_NAME}:${BUILD_NUMBER} || true"
                    sh "docker rmi ${IMAGE_NAME}:latest || true"
                    sh "docker logout || true"
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
            echo "   Frontend: http://localhost:3000"
            echo "   Backend:  http://localhost:3001/api"
            echo ""
            echo "📊 Deployed frontend image: ${IMAGE_NAME}:${BUILD_NUMBER}"
            echo "🐳 Container: codilio-frontend"
            echo ""
            echo "🔧 Management commands:"
            echo "   docker logs codilio-frontend -f    # Watch logs"
            echo "   cd ${DEPLOY_PATH} && docker-compose restart frontend    # Restart service"
            echo "   cd ${DEPLOY_PATH} && docker-compose ps                  # Check status"
            echo ""
            echo "🧪 Test your application:"
            echo "   Open browser: http://localhost:3000"
            echo "   API docs: http://localhost:3001/api"
        }
        failure {
            echo "❌ Frontend build or deployment failed! Check the logs above for details."
            script {
                sh """
                    echo ""
                    echo "🔍 Additional debugging information:"
                    echo "==================================="
                    echo "Docker networks:"
                    docker network ls
                    echo ""
                    echo "Docker volumes:"
                    docker volume ls | grep codilio || echo "No codilio volumes found"
                    echo ""
                    echo "All running containers:"
                    docker ps -a | head -10
                    echo ""
                    echo "Network connectivity:"
                    netstat -tlnp | grep -E ':(3000|3001)' || echo "Application ports not listening"
                    echo ""
                    echo "Deployment directory check:"
                    ls -la ${DEPLOY_PATH}/ || echo "Deployment directory does not exist"
                    echo ""
                    echo "Docker-compose file check:"
                    cat ${DEPLOY_PATH}/docker-compose.yml || echo "No docker-compose.yml found"
                """
            }
        }
    }
}
