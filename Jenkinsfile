pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "codilio/codilio-frontend"
        PRODUCTION_SERVER = "localhost"
        DEPLOY_PATH = "/home/codilio/codilio-app"
        KEEP_VERSIONS = "3"
        // Cloudflare domains - mapiraju na portove 3000/3001
        FRONTEND_URL = "https://codilio2.sbugarin.com"
        API_URL = "https://api-codilio2.sbugarin.com/api"
        FRONTEND_URL_ALT = "https://codilio.sbugarin.com"
        API_URL_ALT = "https://api-codilio.sbugarin.com/api"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'dev', 
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
                        
                        echo "🔄 Updating frontend service..."
                        if [ -f "docker-compose.yml" ]; then
                            echo "✅ Using docker-compose for deployment"
                            
                            echo "🛑 Stopping all services to prevent ContainerConfig errors..."
                            docker-compose down --remove-orphans || true
                            
                            echo "🧹 Cleaning up old containers..."
                            docker container prune -f || true
                            
                            echo "🚀 Starting services with force recreate..."
                            docker-compose up -d --force-recreate
                            
                            echo "⏳ Waiting for services to start..."
                            sleep 30
                        else
                            echo "❌ docker-compose.yml not found in ${DEPLOY_PATH}"
                            echo "Please create the docker-compose.yml file first"
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
                        echo "🧪 Testing frontend at http://localhost:3000 (local)"
                        
                        for i in {1..12}; do
                            if curl -f -s http://localhost:3000/ > /dev/null; then
                                echo "✅ Frontend container is responding locally!"
                                
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
                        
                        if curl -f -s http://localhost:3001/api > /dev/null; then
                            echo "✅ Backend API is reachable locally"
                        else
                            echo "❌ Backend API is not reachable locally"
                            echo "🔧 Checking backend status..."
                            docker ps | grep codilio-backend || echo "Backend container not running"
                            exit 1
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
                        
                        if curl -f -s http://localhost:3000/ > /dev/null; then
                            echo "✅ Frontend is reachable locally"
                        else
                            echo "❌ Frontend is not reachable locally"
                            exit 1
                        fi
                        
                        echo "🔗 Testing frontend-backend communication..."
                        if docker exec codilio-frontend curl -f http://backend:3001/api > /dev/null 2>&1; then
                            echo "✅ Frontend can communicate with backend via Docker network"
                        else
                            echo "⚠️ Frontend-backend Docker network communication issue detected"
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
                        OLD_TAGS=\$(docker images ${IMAGE_NAME} --format "{{.Tag}}" | grep -E '^[0-9]+\ | sort -nr | tail -n +\$((${KEEP_VERSIONS} + 1)))
                        
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
                    echo "Available disk space:"
                    df -h | head -5
                    echo ""
                    echo "Recent images:"
                    docker images | head -10
                    echo ""
                    echo "Deployment directory check:"
                    ls -la ${DEPLOY_PATH}/ || echo "Deployment directory does not exist or no access"
                """
            }
        }
    }
}
