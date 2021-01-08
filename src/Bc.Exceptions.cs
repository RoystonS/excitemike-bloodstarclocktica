using System;

namespace BloodstarClocktica
{
    public static partial class BC
    {
        public class DataException : Exception
        {
            public DataException(string message) : base(message) { }
        }
        public class LoadException : Exception
        {
            public LoadException(string message) : base(message) { }
        }
        public class DuplicateIdException : Exception
        {
            public DuplicateIdException(string message) : base(message) { }
        }
    }
}
