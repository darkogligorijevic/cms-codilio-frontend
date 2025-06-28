pipeline {
    agent any
    
    environment {
        IMAGE_NAME = "codilio/codilio-frontend"
        NODE_VERSION = "18"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'darko-dev', 
                    url: 'https://github.com/samodjolo/cms-codilio-frontend.git'
            }
        }

        stage('Install Dependencies & Build') {
            steps {
                script {
                    // Install dependencies and build the Next.js app
                    sh 'npm ci'
                    sh 'npm run build'
                    
                    // Verify build was successful
                    sh 'ls -la .next/'
                }
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

        stage('Cleanup') {
            steps {
                script {
                    // Remove local images to save space
                    sh "docker rmi ${IMAGE_NAME}:${BUILD_NUMBER} || true"
                    sh "docker rmi ${IMAGE_NAME}:latest || true"
                    sh "docker logout || true"
                    
                    // Clean node_modules and .next to save space
                    sh "rm -rf node_modules .next || true"
                }
            }
        }
    }

    post {
        always {
            script {
                // Clean up workspace only if we're still in node context
                try {
                    cleanWs()
                } catch (Exception e) {
                    echo "Workspace cleanup skipped: ${e.getMessage()}"
                }
            }
        }
        success {
            echo "✅ Frontend build and push completed successfully! Image: ${IMAGE_NAME}:${BUILD_NUMBER}"
        }
        failure {
            echo "❌ Frontend build failed! Check the logs for details."
        }
    }
}
