pipeline {
    agent any

    environment {
        IMAGE_NAME = "codilio/frontend:latest"
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'luka-dev',
                    url: 'https://github.com/darkogligorijevic/cms-codilio-frontend.git',
                    credentialsId: 'dockerhub-creds'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    bat "docker build -t ${IMAGE_NAME} ."
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                script {
                    bat "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin"
                    bat "docker push ${IMAGE_NAME}"
                }
            }
        }
    }
}
