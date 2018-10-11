import tensorflow as tf
import sys
import logging
import time
import grpc
from grpc import RpcError as e
# from predict_client.pbs.prediction_service_pb2 import PredictionServiceStub
# from predict_client.pbs.predict_pb2 import PredictRequest
# from predict_client.util import predict_response_to_dict, make_tensor_proto

from proto_files import predict_pb2, prediction_service_pb2, model_pb2, model_pb2_grpc
from grpc.beta import implementations

logger = logging.getLogger(__name__)

class PredictClient():

    def __init__(self, host, port, model_name, model_version):
        self.host = host
        self.port = port
        self.model_name = model_name
        self.model_version = model_version

        # self.logger = logging.getLogger(self.__class__.__name__)

    def sig_to_key(self, sig):
        if sig == 'serving_default' or sig == 'value':
            return 'value'
        if sig == 'policy':
            return sig
        return 'error'

    def predict(self, request_data, signature_name='serving_default', request_timeout=30, shape=[8*8*13]):

        logger.info('Sending request to tfserving model')
        logger.info('Host: {}'.format(self.host))
        logger.info('Model name: {}'.format(self.model_name))
        logger.info('Model version: {}'.format(self.model_version))

        t = time.time()
        channel = implementations.insecure_channel(self.host, int(self.port))
        logger.debug('Establishing insecure channel took: {}'.format(time.time() - t))

        t = time.time()
        stub = prediction_service_pb2.beta_create_PredictionService_stub(channel)
        logger.debug('Creating stub took: {}'.format(time.time() - t))

        t = time.time()
        request = predict_pb2.PredictRequest()
        logger.debug('Creating request object took: {}'.format(time.time() - t))

        request.model_spec.name = self.model_name
        if self.model_version > 0:
            request.model_spec.version.value = self.model_version

        t = time.time()

        tensor_proto = tf.contrib.util.make_tensor_proto(request_data, dtype=tf.float32, shape=shape)
        request.inputs['x'].CopyFrom(tensor_proto)

        logger.debug('Making tensor protos took: {}'.format(time.time() - t))

        try:
            t = time.time()
            result = stub.Predict(request, timeout=request_timeout)

            logger.debug('Actual request took: {} seconds'.format(time.time() - t))

            # predict_response_dict = predict_response_to_dict(predict_response)

            return list(result.outputs[self.sig_to_key(signature_name)].float_val)
            logger.error(e)

        except:
            
            # logger.error(e)
            # logger.error('Prediction failed!')

            pass

        

        