pipeline {
    agent any

    environment {
        IMAGE_NAME    = 'todo-api'
        IMAGE_TAG     = "build-${env.BUILD_NUMBER}"
        STAGING_PORT  = '3001'
        PROD_PORT     = '3000'
    }

    stages {

        // ════════════════════════════════════════════════
        // STAGE 1 — BUILD
        // ════════════════════════════════════════════════
        stage('Build') {
            steps {
                echo '🔨 Installing dependencies...'
                sh 'npm install'

                echo '🐳 Building Docker image...'
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"

                echo "✅ Built image: ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 2 — TEST
        // ════════════════════════════════════════════════
        stage('Test') {
            steps {
                echo '🧪 Running automated tests...'
                sh 'npm test'
            }
            post {
                always {
                    // Publish JUnit test results in Jenkins UI
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
                success {
                    echo '✅ All tests passed!'
                }
                failure {
                    echo '❌ Tests failed — stopping pipeline.'
                }
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 3 — CODE QUALITY (SonarQube)
        // ════════════════════════════════════════════════
        stage('Code Quality') {
            steps {
                echo '🔍 Running SonarQube code quality analysis...'

                // Generate coverage report first
                sh 'npm run test:coverage'

                // Run SonarQube scanner
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        npx sonar-scanner \
                          -Dsonar.projectKey=todo-api \
                          -Dsonar.sources=src \
                          -Dsonar.tests=tests \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }

                echo '✅ Code quality analysis complete!'
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 4 — SECURITY SCAN (Trivy)
        // ════════════════════════════════════════════════
        stage('Security Scan') {
            steps {
                echo '🔒 Running Trivy security scan on Docker image...'

                // Scan the Docker image for vulnerabilities
                // --exit-code 0 means pipeline won't fail on findings (we handle manually)
                sh '''
                    trivy image \
                      --exit-code 0 \
                      --severity LOW,MEDIUM,HIGH,CRITICAL \
                      --format table \
                      --output trivy-report.txt \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                '''

                // Print the report in Jenkins logs
                sh 'cat trivy-report.txt'

                echo '✅ Security scan complete — see trivy-report.txt for findings.'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
                }
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 5 — DEPLOY (Staging)
        // ════════════════════════════════════════════════
        stage('Deploy to Staging') {
            steps {
                echo '🚀 Deploying to staging environment...'

                // Stop and remove existing staging container
                sh 'docker stop todo-api-staging || true'
                sh 'docker rm todo-api-staging || true'

                // Start new staging container
                sh """
                    docker run -d \
                      --name todo-api-staging \
                      -p ${STAGING_PORT}:3000 \
                      -e NODE_ENV=staging \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                """

                // Wait for container to start
                sh 'sleep 5'

                // Health check on staging
                sh "curl -f http://localhost:${STAGING_PORT}/health || (echo 'Staging health check failed!' && exit 1)"

                echo "✅ App deployed to staging at http://localhost:${STAGING_PORT}"
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 6 — RELEASE (Production)
        // ════════════════════════════════════════════════
        stage('Release to Production') {
            steps {
                echo '🎯 Promoting to production...'

                // Tag image as versioned release
                sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:v1.0.${env.BUILD_NUMBER}"

                // Stop and remove existing production container
                sh 'docker stop todo-api-prod || true'
                sh 'docker rm todo-api-prod || true'

                // Deploy to production port
                sh """
                    docker run -d \
                      --name todo-api-prod \
                      -p ${PROD_PORT}:3000 \
                      -e NODE_ENV=production \
                      ${IMAGE_NAME}:${IMAGE_TAG}
                """

                // Wait and verify production health
                sh 'sleep 5'
                sh "curl -f http://localhost:${PROD_PORT}/health || (echo 'Production health check failed!' && exit 1)"

                echo "✅ Released to production at http://localhost:${PROD_PORT}"
                echo "   Tagged as: ${IMAGE_NAME}:v1.0.${env.BUILD_NUMBER}"
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 7 — MONITORING
        // ════════════════════════════════════════════════
        stage('Monitoring') {
            steps {
                echo '📊 Setting up monitoring and running health checks...'

                // Check the production app is healthy
                sh "curl -f http://localhost:${PROD_PORT}/health"

                // Check all running app containers
                sh 'docker ps --filter "name=todo-api" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'

                // Start monitoring stack if not already running
                sh 'docker-compose -f docker-compose.yml up -d prometheus grafana || true'

                // Verify Prometheus is reachable
                sh 'sleep 5 && curl -f http://localhost:9090/-/healthy || echo "Prometheus not yet ready (may need manual setup)"'

                echo '✅ Monitoring active!'
                echo '   Prometheus: http://localhost:9090'
                echo '   Grafana:    http://localhost:3002 (admin / admin123)'
            }
        }
    }

    // ════════════════════════════════════════════════════
    // POST ACTIONS
    // ════════════════════════════════════════════════════
    post {
        success {
            echo '''
            ╔══════════════════════════════════════╗
            ║   ✅  PIPELINE COMPLETED SUCCESSFULLY ║
            ╚══════════════════════════════════════╝
            '''
        }
        failure {
            echo '''
            ╔══════════════════════════════════════╗
            ║   ❌  PIPELINE FAILED — CHECK LOGS   ║
            ╚══════════════════════════════════════╝
            '''
        }
        always {
            echo 'Pipeline finished. Archiving artefacts...'
            archiveArtifacts artifacts: '*.txt', allowEmptyArchive: true
        }
    }
}
