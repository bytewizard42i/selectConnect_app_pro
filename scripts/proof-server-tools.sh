#!/bin/bash
# Midnight Proof Server Management Tools
# Utilities for managing and monitoring the local proof server

set -e

PROOF_SERVER_URL="http://localhost:6300"
METRICS_URL="http://localhost:6301"

case "$1" in
    "status")
        echo "🔍 Checking Midnight Proof Server Status..."
        curl -s "$METRICS_URL/health" | jq '.' || echo "❌ Proof server not responding"
        ;;
    
    "metrics")
        echo "📊 Proof Server Metrics:"
        curl -s "$METRICS_URL/metrics" || echo "❌ Metrics not available"
        ;;
    
    "circuits")
        echo "📋 Available Circuits:"
        curl -s "$PROOF_SERVER_URL/circuits" | jq '.' || echo "❌ Cannot list circuits"
        ;;
    
    "prove")
        if [ -z "$2" ]; then
            echo "Usage: $0 prove <circuit_name> [witness_data]"
            exit 1
        fi
        
        CIRCUIT_NAME="$2"
        WITNESS_DATA="${3:-{}}"
        
        echo "🔐 Generating proof for circuit: $CIRCUIT_NAME"
        curl -X POST "$PROOF_SERVER_URL/prove" \
            -H "Content-Type: application/json" \
            -d "{\"circuit\": \"$CIRCUIT_NAME\", \"witness\": $WITNESS_DATA}" \
            | jq '.'
        ;;
    
    "logs")
        echo "📝 Proof Server Logs:"
        docker logs midnight-proof-server --tail 50 -f
        ;;
    
    "restart")
        echo "🔄 Restarting Proof Server..."
        docker-compose restart midnight-proof-server
        echo "✅ Proof server restarted"
        ;;
    
    "benchmark")
        echo "⚡ Running proof generation benchmark..."
        time curl -X POST "$PROOF_SERVER_URL/prove" \
            -H "Content-Type: application/json" \
            -d '{"circuit": "test", "witness": {}}' \
            > /dev/null 2>&1 && echo "✅ Benchmark complete" || echo "❌ Benchmark failed"
        ;;
    
    *)
        echo "Midnight Proof Server Tools"
        echo "Usage: $0 {status|metrics|circuits|prove|logs|restart|benchmark}"
        echo ""
        echo "Commands:"
        echo "  status     - Check server health"
        echo "  metrics    - Show performance metrics"
        echo "  circuits   - List available circuits"
        echo "  prove      - Generate proof for circuit"
        echo "  logs       - Show server logs"
        echo "  restart    - Restart proof server"
        echo "  benchmark  - Run performance test"
        ;;
esac
