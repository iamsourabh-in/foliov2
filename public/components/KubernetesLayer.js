import React, { useState, useEffect } from 'react';
const KubernetesLayer = () => {
    const [pods, setPods] = useState([
        { name: 'portfolio-deployment-a8sde', status: 'Running' },
        { name: 'portfolio-deployment-8adj3', status: 'Running' },
        { name: 'portfolio-deployment-k2ksj', status: 'Pending' },
    ]);

    const scaleUp = () => {
        const newPod = {
            name: `portfolio-deployment-${Math.random().toString(36).substring(5)}`,
            status: 'Pending',
        };
        setPods(prev => [...prev, newPod]);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setPods(prevPods => {
                return prevPods.map(pod => {
                    if (pod.status === 'Pending') {
                        return { ...pod, status: 'Running' };
                    }
                    if (Math.random() < 0.1) {
                        return { ...pod, status: 'Succeeded' };
                    }
                    return pod;
                });
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Running':
                return 'text-green-400';
            case 'Pending':
                return 'text-yellow-400';
            case 'Succeeded':
                return 'text-blue-400';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-4xl font-bold mb-8">Kubernetes Layer</h2>
                <div className="bg-gray-800 p-8 rounded-lg w-full max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold">Pod Deployments</h3>
                        <button onClick={scaleUp} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Scale Up</button>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pods.map((pod, index) => (
                                <tr key={index}>
                                    <td className="p-2">{pod.name}</td>
                                    <td className={`p-2 ${getStatusColor(pod.status)}`}>{pod.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default KubernetesLayer;