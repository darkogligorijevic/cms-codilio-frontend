pipeline {
    agent any

    stages {
        stage('Clone') {
            steps {
                git url: 'https://github.com/darkogligorijevic/cms-codilio-frontend.git', branch: 'luka-dev'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("codilio/frontend:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    script {
                        bat "docker login -u %USERNAME% -p %PASSWORD%"
                        bat "docker tag codilio/frontend:${BUILD_NUMBER} codilio/frontend:${BUILD_NUMBER}"
                        bat "docker push codilio/frontend:${BUILD_NUMBER}"
                    }
                }
            }
        }
    }
}
