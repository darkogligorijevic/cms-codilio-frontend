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
                    
                    # ⚠️ NOVA METODA: Kompletno restartovanje
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
                    exit 1
                fi
                
                echo "✅ Frontend deployment stage completed"
            """
        }
    }
}
