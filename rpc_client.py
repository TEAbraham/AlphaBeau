from grpc import RpcError
import logging
import time
import grpc
from grpc import RpcError
from predict_client.pbs.prediction_service_pb2 import PredictionServiceStub
from predict_client.pbs.predict_pb2 import PredictRequest
from predict_client.util import predict_response_to_dict, make_tensor_proto

logger = logging.getLogger(__name__)

class PredictClient():

    def __init__(self, host, port, model_name, model_version):
        self.host = host
        self.port = port
        self.model_name = model_name
        self.model_version = model_version

        self.logger = logging.getLogger(self.__class__.__name__)

    def sig_to_key(self, sig):
        if sig == 'serving_default' or sig == 'value':
            return 'value'
        if sig == 'policy':
            return sig
        return 'error'

    def predict(self, request_data, signature_name='serving_default', request_timeout=5, shape=[8*8*13]):

        self.logger.info('Sending request to tfserving model')
        self.logger.info('Host: {}'.format(self.host))
        self.logger.info('Model name: {}'.format(self.model_name))
        self.logger.info('Model version: {}'.format(self.model_version))

        self.logger.info('Sending request to tfserving model')
        self.logger.info('Host: {}'.format(self.host))
        self.logger.info('Model name: {}'.format(self.model_name))
        self.logger.info('Model version: {}'.format(self.model_version))

        t = time.time()
        channel = grpc.insecure_channel(self.host)
        self.logger.debug('Establishing insecure channel took: {}'.format(time.time() - t))

        t = time.time()
        stub = PredictionServiceStub(channel)
        self.logger.debug('Creating stub took: {}'.format(time.time() - t))

        t = time.time()
        request = PredictRequest()
        self.logger.debug('Creating request object took: {}'.format(time.time() - t))

        request.model_spec.name = self.model_name
        if self.model_version > 0:
            request.model_spec.version.value = self.model_version

        t = time.time()
        for d in request_data:
            tensor_proto = make_tensor_proto(d, 'DT_FLOAT')
            request.inputs['x'].CopyFrom(tensor_proto)

        self.logger.debug('Making tensor protos took: {}'.format(time.time() - t))

        try:
            t = time.time()
            predict_response = stub.Predict(request, timeout=request_timeout)

            self.logger.debug('Actual request took: {} seconds'.format(time.time() - t))

            predict_response_dict = predict_response_to_dict(predict_response)

 
            return list(predict_response_dict([self.sig_to_key(signature_name)]))

        except RpcError as e:
            
            # self.logger.error(e)
            # self.logger.error('Prediction failed!')

            pass

        return {}

        