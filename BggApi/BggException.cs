using System.Runtime.Serialization;

namespace BggApi {
    public class BggException : Exception {
        public BggException() {
        }

        public BggException(string? message) : base(message) {
        }

        public BggException(string? message, Exception? innerException) : base(message, innerException) {
        }

        protected BggException(SerializationInfo info, StreamingContext context) : base(info, context) {
        }
    }
}
