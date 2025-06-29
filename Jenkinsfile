pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "codilio/codilio-frontend"
        PRODUCTION_SERVER = "localhost"  // LOCALHOST - bez server credentials
        DEPLOY_PATH = "/home/codilio/codilio-app"     // Promeni na putanju gde ti je docker-compose.yml
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
                            echo "📁 Using current directory: \$(pwd)"
                            echo "📁 Current directory contents:"
                            ls -la
                        fi
                        
                        echo "📥 Pulling latest frontend image..."
                        docker pull ${IMAGE_NAME}:latest
                        
                        echo "🔄 Updating frontend service..."
                        if [ -f "docker-compose.yml" ]; then
                            echo "✅ Using docker-compose for deployment"
                            docker-compose pull frontend
                            docker-compose up -d frontend
                            echo "⏳ Waiting for frontend to start..."
                            sleep 25
                        else
                            echo "⚠️ docker-compose.yml not found, using direct docker commands"
                            docker stop codilio-frontend || true
                            docker rm codilio-frontend || true
                            docker run -d \\
                                --name codilio-frontend \\
                                --restart unless-stopped \\
                                -p 3000:3000 \\
                                --network codilio-network \\
                                -e NODE_ENV=production \\
                                -e NEXT_PUBLIC_API_URL=http://localhost:3001/api \\
                                ${IMAGE_NAME}:latest
                            echo "⏳ Waiting for frontend to start..."
                            sleep 25
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
            echo "   docker-compose restart frontend    # Restart service"
            echo "   docker-compose ps                  # Check status"
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
                    echo "All running containers:"
                    docker ps -a | head -10
                    echo ""
                    echo "Network connectivity:"
                    netstat -tlnp | grep -E ':(3000|3001)' || echo "Application ports not listening"
                    echo ""
                    echo "Docker networks:"
                    docker network ls | grep codilio || echo "No codilio networks found"
                """
            }
        }
    }
}
